import { authFetch } from '../../../../hooks/use-auth-axios.ts'

export class LogStreamError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message)
        this.name = 'LogStreamError'
    }
}

export type LogSource = { instanceId: number; selector: string; replica: string; container?: string; tail: number }

/* The endpoint follows the log, so the response only ends when the container stops or the request is
 * aborted. Nothing is accumulated here: each decoded chunk goes to onChunk and is forgotten, so what
 * the page holds is up to the caller. tail is always sent, since leaving it out asks for the whole log. */
export const streamLog = async (source: LogSource, onChunk: (text: string) => void, signal: AbortSignal): Promise<void> => {
    const params = new URLSearchParams({ selector: source.selector, replica: source.replica, tail: String(source.tail) })
    if (source.container) {
        params.set('container', source.container)
    }
    // authFetch has already refreshed on a 401 and ended the session if that didn't help
    const res = await authFetch(`/instances/${source.instanceId}/logs?${params}`, { signal })
    if (!res.ok) {
        throw new LogStreamError(res.status, (await res.text()) || res.statusText || `HTTP ${res.status}`)
    }
    if (!res.body) {
        throw new LogStreamError(res.status, 'The response has no body')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    try {
        for (;;) {
            const { done, value } = await reader.read()
            /* A chunk that was already queued when the request was aborted is not worth delivering. */
            signal.throwIfAborted()
            if (done) {
                break
            }
            onChunk(decoder.decode(value, { stream: true }))
        }
        const rest = decoder.decode()
        if (rest) {
            onChunk(rest)
        }
    } finally {
        /* Cancelling closes the connection when we leave early, and is a no-op after a clean end. */
        reader.cancel().catch(() => {})
        reader.releaseLock()
    }
}
