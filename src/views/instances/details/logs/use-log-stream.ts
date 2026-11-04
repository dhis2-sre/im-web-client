import { useEffect, useState } from 'react'
import { appendCapped, createLineSplitter, dropOverlap, MAX_HELD_CHARS, reconnectDivider, toEntries } from './log-lines.ts'
import type { LogEntry, LogLevel } from './log-lines.ts'
import { LogStreamError, streamLog } from './log-stream.ts'
import type { LogSource } from './log-stream.ts'

export type StreamStatus = 'connecting' | 'live' | 'waiting' | 'reconnecting' | 'error'
export type LogView = { entries: LogEntry[]; total: number; dropped: number; status: StreamStatus; error?: string }

/* At most 10 renders a second. A timer rather than requestAnimationFrame, which stops in a background tab
 * and would let lines pile up. */
export const FLUSH_MS = 100
const RECONNECT_MS = 2000
const GIVE_UP_MS = 10 * 60 * 1000
const MAX_FAILURES = 3
// How long a quiet reconnect waits for the resent tail before matching it against the held lines
const OVERLAP_WAIT_MS = 1000
// A non-OK body can be a whole HTML page
const MAX_ERROR_CHARS = 300

// The waits grow so a broken or starting instance isn't hammered: 4s, 8s, 16s, then every 30s
export const backoffMs = (attempt: number): number => [4000, 8000, 16000][attempt] ?? 30000

const EMPTY: LogView = { entries: [], total: 0, dropped: 0, status: 'connecting' }

/* One live log connection. Everything mutable lives in this closure, and React only sees what render()
 * hands it. Each connect() bumps the generation, so callbacks of an older request or timer do nothing,
 * and only one request is open at a time. stop() leaves nothing running: no request, no timer. */
export const createLogConnection = (render: (update: (view: LogView) => LogView) => void) => {
    let source: LogSource | undefined
    let resetKey: string | undefined
    let restarts = 0
    // What the current stream started with, to tell a restart or replacement from a quiet cut
    let started: { replica: string; restarts: number } | undefined

    let gen = 0
    let controller: AbortController | undefined
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let flushTimer: ReturnType<typeof setTimeout> | undefined
    let holdTimer: ReturnType<typeof setTimeout> | undefined

    let entries: LogEntry[] = []
    // Waiting for the next flush; capped like entries, so it can't grow either
    let pending: LogEntry[] = []
    let total = 0
    let dropped = 0
    let nextId = 0
    let level: LogLevel

    /* Lines of a quiet reconnect, set aside until they can be matched against what is held. Released at tail
     * lines or MAX_HELD_CHARS, whichever comes first, so they obey the same caps as everything else. */
    let holding: string[] | undefined
    let holdingChars = 0
    let attempt = 0
    let failures = 0
    let lastLineAt = 0
    let gotLine = false

    const setStatus = (status: StreamStatus, error?: string) => render((view) => ({ ...view, status, error }))

    const flush = () => {
        flushTimer = undefined
        if (pending.length === 0) {
            return
        }
        const result = appendCapped(entries, pending)
        entries = result.entries
        dropped += result.dropped
        pending = []
        render((view) => ({ ...view, entries, total, dropped }))
    }

    const scheduleFlush = () => {
        if (pending.length > 0 && flushTimer === undefined) {
            flushTimer = setTimeout(flush, FLUSH_MS)
        }
    }

    const add = (added: LogEntry[]) => {
        const result = appendCapped(pending, added)
        pending = result.entries
        dropped += result.dropped
        scheduleFlush()
    }

    const addLines = (lines: string[]) => {
        if (lines.length === 0) {
            return
        }
        const added = toEntries(lines, level, nextId)
        nextId += added.length
        level = (added[added.length - 1] as { level: LogLevel }).level
        total += added.length
        lastLineAt = Date.now()
        attempt = 0
        gotLine = true
        add(added)
    }

    const addDivider = (text: string) => add([{ id: nextId++, kind: 'divider', text }])

    const take = (lines: string[]) => {
        if (holding) {
            holding = holding.concat(lines)
            holdingChars += lines.reduce((sum, line) => sum + line.length, 0)
        } else {
            addLines(lines)
        }
    }

    const releaseHeld = () => {
        clearTimeout(holdTimer)
        holdTimer = undefined
        const lines = holding
        holding = undefined
        holdingChars = 0
        if (!lines || lines.length === 0) {
            return
        }
        const result = dropOverlap(entries.concat(pending), lines)
        if (!result.found) {
            addDivider('Reconnected')
        }
        addLines(result.lines)
    }

    const fail = (message: string) => setStatus('error', message.slice(0, MAX_ERROR_CHARS))

    const later = (status: StreamStatus, wait: number) => {
        // Measured from the last new line, across reconnects and waiting
        if (Date.now() - lastLineAt >= GIVE_UP_MS) {
            fail('Stopped trying after 10 minutes')
            return
        }
        setStatus(status)
        retryTimer = setTimeout(() => {
            retryTimer = undefined
            connect()
        }, wait)
    }

    const connect = () => {
        const my = ++gen
        const ctl = new AbortController()
        controller = ctl
        const from = source
        const now = { replica: from.replica, restarts }
        const before = started
        started = now
        if (before && entries.length + pending.length > 0) {
            const divider = reconnectDivider(before, now, new Date())
            if (divider) {
                addDivider(divider)
            } else {
                holding = []
            }
        }
        scheduleFlush()

        const splitter = createLineSplitter()
        level = undefined
        gotLine = false
        let first = true
        // Any error after an abort is ours (an abort during the token refresh can surface as an axios error)
        const current = () => my === gen && !ctl.signal.aborted

        const onChunk = (chunk: string) => {
            if (!current()) {
                return
            }
            if (first) {
                first = false
                failures = 0
                if (holding) {
                    setStatus('reconnecting')
                    holdTimer = setTimeout(() => {
                        releaseHeld()
                        setStatus('live')
                    }, OVERLAP_WAIT_MS)
                } else {
                    setStatus('live')
                }
            }
            take(splitter.push(chunk))
            if (holding && (holding.length >= from.tail || holdingChars >= MAX_HELD_CHARS)) {
                releaseHeld()
                setStatus('live')
            }
        }

        const ended = () => {
            if (!current()) {
                return
            }
            controller = undefined
            take(splitter.flush())
            releaseHeld()
            // A stream that keeps ending without anything new backs off like a 409
            later('reconnecting', gotLine ? RECONNECT_MS : backoffMs(attempt++))
        }

        const failed = (error: unknown) => {
            if (!current()) {
                return
            }
            controller = undefined
            releaseHeld()
            if (error instanceof LogStreamError && error.status === 409) {
                later('waiting', backoffMs(attempt++))
                return
            }
            failures++
            // streamLog has already tried a token refresh and signalled the expired session, so don't repeat that
            if (failures >= MAX_FAILURES || (error instanceof LogStreamError && error.status === 401)) {
                fail(error instanceof Error ? error.message : String(error))
                return
            }
            later(total === 0 ? 'connecting' : 'reconnecting', backoffMs(attempt++))
        }

        streamLog(from, onChunk, ctl.signal).then(ended, failed)
    }

    const stop = () => {
        gen++
        controller?.abort()
        controller = undefined
        // Keeps the set-aside lines when only the replica changes; on unmount they are simply never shown
        releaseHeld()
        clearTimeout(retryTimer)
        clearTimeout(flushTimer)
        retryTimer = undefined
        flushTimer = undefined
    }

    const begin = () => {
        attempt = 0
        failures = 0
        lastLineAt = Date.now()
        setStatus('connecting')
        connect()
    }

    return {
        setRestarts: (value: number) => {
            restarts = value
        },
        // A new resetKey starts over; any other change keeps the lines and reconnects
        start: (next: LogSource, key: string) => {
            stop()
            if (key !== resetKey) {
                entries = []
                pending = []
                total = 0
                dropped = 0
                started = undefined
                render(() => EMPTY)
            }
            source = next
            resetKey = key
            begin()
        },
        stop,
        retry: () => {
            if (source) {
                stop()
                begin()
            }
        },
    }
}

export const useLogStream = (
    source: LogSource,
    restarts: number,
    // Off while the log is out of sight: the stream stops, and starting again keeps what was held
    { resetKey, active = true }: { resetKey: string; active?: boolean }
): {
    entries: LogEntry[]
    total: number
    dropped: number
    status: StreamStatus
    error?: string
    retry: () => void
} => {
    const [view, setView] = useState<LogView>(EMPTY)
    // Creating it has no side effects, so StrictMode calling this twice is harmless
    const [connection] = useState(() => createLogConnection(setView))
    const { instanceId, selector, replica, container, tail } = source

    // Declared first so a reconnect in the same commit sees the new count
    useEffect(() => connection.setRestarts(restarts), [connection, restarts])

    // The drawer rebuilds source every render, so its fields are the dependencies, not the object
    useEffect(() => {
        if (!active) {
            return
        }
        connection.start({ instanceId, selector, replica, container, tail }, resetKey)
        return connection.stop
    }, [connection, active, resetKey, instanceId, selector, replica, container, tail])

    return { ...view, retry: connection.retry }
}
