import { LogStreamError, streamLog } from './log-stream.ts'
import type { LogSource } from './log-stream.ts'
import { backoffMs, createLogConnection, FLUSH_MS } from './use-log-stream.ts'
import type { LogView } from './use-log-stream.ts'

// The real module reads import.meta.env, which Jest can't load (jest.mock is hoisted above the imports)
jest.mock('./log-stream.ts', () => {
    class LogStreamError extends Error {
        constructor(
            public status: number,
            message: string
        ) {
            super(message)
        }
    }
    return { LogStreamError, streamLog: jest.fn() }
})

type Call = { onChunk: (text: string) => void; signal: AbortSignal; resolve: () => void; reject: (error: unknown) => void }

const source: LogSource = { instanceId: 1, selector: 'app', replica: 'pod-a', tail: 3 }
let calls: Call[]
let view: LogView

const setup = () => {
    const connection = createLogConnection((update) => {
        view = update(view)
    })
    connection.start(source, 'key')
    return connection
}
const last = () => calls[calls.length - 1]
const texts = () => view.entries.map((entry) => entry.text)
const settle = async (ms = 0) => {
    await jest.advanceTimersByTimeAsync(ms)
}

beforeEach(() => {
    jest.useFakeTimers()
    calls = []
    view = undefined
    jest.mocked(streamLog).mockImplementation(
        (_source, onChunk, signal) =>
            new Promise<void>((resolve, reject) => {
                calls.push({ onChunk, signal, resolve, reject })
            })
    )
})
afterEach(() => jest.useRealTimers())

describe('backoffMs', () => {
    it('waits 4s, 8s, 16s, then 30s', () => {
        expect([0, 1, 2, 3, 9].map(backoffMs)).toEqual([4000, 8000, 16000, 30000, 30000])
    })
})

describe('createLogConnection', () => {
    it('goes live on the first chunk and batches lines into one update', async () => {
        setup()
        expect(view.status).toBe('connecting')
        last().onChunk('a\nb\n')
        last().onChunk('c\n')
        expect(view.status).toBe('live')
        expect(view.entries).toEqual([])
        await settle(FLUSH_MS)
        expect(texts()).toEqual(['a', 'b', 'c'])
        expect(view.total).toBe(3)
    })

    it('waits on a 409 with growing back-off and keeps the lines', async () => {
        setup()
        last().onChunk('a\n')
        last().resolve()
        await settle(2000)
        last().reject(new LogStreamError(409, 'starting'))
        await settle()
        expect(view.status).toBe('waiting')
        await settle(3999)
        expect(calls).toHaveLength(2)
        await settle(1)
        expect(calls).toHaveLength(3)
        last().reject(new LogStreamError(409, 'starting'))
        await settle(7999)
        expect(calls).toHaveLength(3)
        await settle(1)
        expect(calls).toHaveLength(4)
        expect(texts()).toEqual(['a'])
    })

    it('adds a divider when the container restarted', async () => {
        const connection = setup()
        last().onChunk('a\n')
        last().resolve()
        connection.setRestarts(1)
        await settle()
        expect(view.status).toBe('reconnecting')
        await settle(2000)
        last().onChunk('b\n')
        await settle(FLUSH_MS)
        expect(texts()[0]).toBe('a')
        expect(texts()[1]).toMatch(/^Container restarted at/)
        expect(texts()[2]).toBe('b')
    })

    it('marks a restart reported after the stream already reconnected, and only once', async () => {
        const connection = setup()
        last().onChunk('a\nb\nc\n')
        last().resolve()
        await settle(2000)
        last().onChunk('x\n')
        connection.setRestarts(1)
        await settle(1000)
        expect(view.status).toBe('live')
        await settle(FLUSH_MS)
        expect(texts()).toHaveLength(5)
        expect(texts()[3]).toMatch(/^Container restarted at/)
        expect(texts()[4]).toBe('x')
        last().resolve()
        await settle(2000)
        last().onChunk('x\n')
        await settle(FLUSH_MS)
        expect(texts().filter((text) => text.startsWith('Container restarted'))).toHaveLength(1)
    })

    it('marks a restart late when the open stream outlives the settle wait', async () => {
        const connection = setup()
        last().onChunk('a\n')
        connection.setRestarts(1)
        await settle(999)
        expect(texts()).toEqual(['a'])
        await settle(1 + FLUSH_MS)
        expect(texts()[1]).toMatch(/^Container restarted at/)
    })

    it('waits on a 404, as when the pod is gone before its replacement is listed', async () => {
        setup()
        last().onChunk('a\n')
        last().resolve()
        for (const wait of [2000, 4000, 8000, 16000]) {
            await settle(wait)
            last().reject(new LogStreamError(404, 'pod not found'))
            await settle()
            expect(view.status).toBe('waiting')
        }
    })

    it('drops the resent tail after a quiet cut', async () => {
        setup()
        last().onChunk('a\nb\nc\n')
        last().resolve()
        await settle(2000)
        last().onChunk('b\nc\nd\n')
        expect(view.status).toBe('live')
        await settle(FLUSH_MS)
        expect(texts()).toEqual(['a', 'b', 'c', 'd'])
    })

    it('adds Reconnected when the overlap is not found within a second', async () => {
        setup()
        last().onChunk('a\nb\nc\n')
        last().resolve()
        await settle(2000)
        last().onChunk('x\n')
        expect(view.status).toBe('reconnecting')
        await settle(1000)
        expect(view.status).toBe('live')
        await settle(FLUSH_MS)
        expect(texts()).toEqual(['a', 'b', 'c', 'Reconnected', 'x'])
    })

    it('gives up on the third failure in a row, and retry starts again', async () => {
        const connection = setup()
        last().reject(new TypeError('Failed to fetch'))
        await settle()
        // No line has ever arrived, so this is still the first connect
        expect(view.status).toBe('connecting')
        await settle(4000)
        last().reject(new TypeError('Failed to fetch'))
        await settle(8000)
        last().reject(new LogStreamError(500, 'x'.repeat(1000)))
        await settle()
        expect(view.status).toBe('error')
        expect(view.error).toHaveLength(300)
        await settle(60000)
        expect(calls).toHaveLength(3)
        connection.retry()
        expect(view.status).toBe('connecting')
        expect(calls).toHaveLength(4)
    })

    it('does not retry a 401, since streamLog already tried a refresh', async () => {
        setup()
        last().reject(new LogStreamError(401, 'Unauthorized'))
        await settle(60000)
        expect(view).toMatchObject({ status: 'error', error: 'Unauthorized' })
        expect(calls).toHaveLength(1)
    })

    it('shows reconnecting while a quiet reconnect holds lines, even after retry', async () => {
        const connection = setup()
        last().onChunk('a\nb\nc\n')
        connection.retry()
        expect(view.status).toBe('connecting')
        last().onChunk('x\n')
        expect(view.status).toBe('reconnecting')
        await settle(1000)
        expect(view.status).toBe('live')
    })

    it('releases the hold early once it reaches MAX_HELD_CHARS', async () => {
        const connection = setup()
        last().onChunk('a\n')
        connection.stop()
        connection.start({ ...source, tail: 5000 }, 'key')
        // 800 lines of 5000 characters: far below tail, but 4,000,000 characters
        last().onChunk(`${'y'.repeat(5000)}\n`.repeat(800))
        expect(view.status).toBe('live')
        await settle(FLUSH_MS)
        // The held cap then drops 'a' and the 'Reconnected' divider to stay at 4,000,000 characters
        expect(view).toMatchObject({ total: 801, dropped: 2 })
        expect(view.entries).toHaveLength(800)
    })

    it('stops trying after 10 minutes without a new line', async () => {
        setup()
        for (let i = 0; i < 30 && view.status !== 'error'; i++) {
            last().reject(new LogStreamError(409, 'starting'))
            await settle(30000)
        }
        expect(view.error).toBe('Stopped trying after 10 minutes')
        const count = calls.length
        await settle(120000)
        expect(calls).toHaveLength(count)
    })

    it('ignores an old request after stop, and a StrictMode restart opens one stream', async () => {
        const connection = setup()
        const old = last()
        connection.stop()
        connection.start(source, 'key')
        expect(old.signal.aborted).toBe(true)
        old.onChunk('stale\n')
        old.reject(new TypeError('late'))
        last().onChunk('a\n')
        await settle(FLUSH_MS)
        expect(texts()).toEqual(['a'])
        connection.stop()
        last().onChunk('b\n')
        await settle(60000)
        expect(calls).toHaveLength(2)
        expect(texts()).toEqual(['a'])
    })

    it('keeps the lines and adds a divider when the replica is replaced', async () => {
        const connection = setup()
        last().onChunk('a\n')
        connection.stop()
        connection.start({ ...source, replica: 'pod-b' }, 'key')
        last().onChunk('b\n')
        await settle(FLUSH_MS)
        expect(texts()).toEqual(['a', 'pod-a was replaced · now showing pod-b', 'b'])
        connection.start(source, 'other')
        expect(view.entries).toEqual([])
    })
})
