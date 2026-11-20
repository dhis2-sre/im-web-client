/*
 * The caps below exist so a chatty or runaway container can never make the
 * browser run out of memory: every stage (splitter, list, render) is bounded.
 */
export const MAX_LINES = 10000
export const MAX_HELD_CHARS = 4_000_000
export const MAX_LINE_CHARS = 5000
export const RENDER_LINES = 2000

export type LogLevel = 'error' | 'warn' | undefined
// id is a running number that stays stable while the cap drops older entries, so it works as the React key
export type LogEntry = { id: number; kind: 'line'; text: string; level: LogLevel } | { id: number; kind: 'divider'; text: string }
export type LevelFilter = 'all' | 'warn' | 'error'

// Only the start of a line is searched, so "ERROR" typed inside a message does not count.
export const LEVEL_WORD = /\b(ERROR|FATAL|SEVERE|WARN|WARNING|INFO|DEBUG|TRACE)\b/
export const LEVEL_SEARCH_CHARS = 40
// Stack frames, "Caused by:" and blank lines belong to the entry above them.
const CONTINUATION = /^(\s|$|Caused by:|Suppressed:|\.\.\. \d+ (more|common))|^[\w.$]+(Exception|Error)\b/

export const levelOf = (text: string, previous: LogLevel): LogLevel => {
    const word = LEVEL_WORD.exec(text.slice(0, LEVEL_SEARCH_CHARS))?.[1]
    if (word) {
        if (word === 'ERROR' || word === 'FATAL' || word === 'SEVERE') {
            return 'error'
        }
        if (word === 'WARN' || word === 'WARNING') {
            return 'warn'
        }
        return undefined
    }
    return CONTINUATION.test(text) ? previous : undefined
}

export const toEntries = (lines: string[], previous: LogLevel, firstId: number): LogEntry[] => {
    let level = previous
    return lines.map((text, i) => {
        level = levelOf(text, level)
        return { id: firstId + i, kind: 'line', text, level }
    })
}

// Why: split/slice/concat results are V8 sliced strings that keep their whole source chunk alive, so a few
// kept lines could pin hundreds of MB. A JSON round trip makes a fresh, flat string that owns only its own text.
const own = (text: string): string => JSON.parse(JSON.stringify(text))

export const createLineSplitter = (maxLineChars = MAX_LINE_CHARS) => {
    let held = ''
    // Characters of the unfinished line that were counted but not kept
    let overflow = 0

    const add = (piece: string) => {
        const room = maxLineChars - held.length
        if (piece.length <= room) {
            held += piece
        } else {
            held += piece.slice(0, room)
            overflow += piece.length - room
        }
    }

    const finish = () => {
        if (overflow === 0 && held.endsWith('\r')) {
            held = held.slice(0, -1)
        }
        const line = overflow > 0 ? `${held}… [${overflow} more characters]` : held
        held = ''
        overflow = 0
        return own(line)
    }

    return {
        push: (chunk: string): string[] => {
            const pieces = chunk.split('\n')
            const done: string[] = []
            pieces.forEach((piece, i) => {
                add(piece)
                if (i < pieces.length - 1) {
                    done.push(finish())
                }
            })
            held = own(held)
            return done
        },
        flush: (): string[] => (held === '' && overflow === 0 ? [] : [finish()]),
    }
}

export const appendCapped = (entries: LogEntry[], added: LogEntry[], caps: { lines?: number; chars?: number } = {}): { entries: LogEntry[]; dropped: number } => {
    const maxLines = caps.lines ?? MAX_LINES
    const maxChars = caps.chars ?? MAX_HELD_CHARS
    const all = entries.concat(added)
    // Apply the line cap first so the character sum never walks entries that are dropped anyway
    let start = Math.max(0, all.length - maxLines)
    let total = 0
    for (let i = start; i < all.length; i++) {
        total += all[i].text.length
    }
    while (total > maxChars && start < all.length) {
        total -= all[start++].text.length
    }
    return start === 0 ? { entries: all, dropped: 0 } : { entries: all.slice(start), dropped: start }
}

const OVERLAP_LINES = 3

// After a reconnect the server may resend lines we already hold. Match the last few held lines (one repeated
// line would match far too early) and keep only what follows their FIRST occurrence: with repetitive lines such
// as heartbeats, the last occurrence would silently drop new lines, while the first can only show a duplicate.
// Dividers are not server lines, so they are skipped. If the resent window starts partway through that run,
// accept a shorter run, but only at the very start of the incoming lines.
export const dropOverlap = (held: LogEntry[], incoming: string[]): { lines: string[]; found: boolean } => {
    const tail: string[] = []
    for (let i = held.length - 1; i >= 0 && tail.length < OVERLAP_LINES; i--) {
        const entry = held[i]
        if (entry.kind === 'line') {
            tail.unshift(entry.text)
        }
    }
    const matchesAt = (run: string[], at: number) => run.every((text, j) => incoming[at + j] === text)
    for (let i = 0; i <= incoming.length - tail.length && tail.length > 0; i++) {
        if (matchesAt(tail, i)) {
            return { lines: incoming.slice(i + tail.length), found: true }
        }
    }
    for (let k = tail.length - 1; k > 0; k--) {
        if (matchesAt(tail.slice(-k), 0)) {
            return { lines: incoming.slice(k), found: true }
        }
    }
    return { lines: incoming, found: false }
}

/* Entries never change once made, so each one's verdict for a filter is worked out once rather than on every
 * flush, which would lower-case every held line ten times a second. Undefined when nothing is filtered. */
export const createMatcher = (query: string, level: LevelFilter): ((entry: LogEntry) => boolean) | undefined => {
    if (query === '' && level === 'all') {
        return undefined
    }
    const needle = query.toLowerCase()
    const verdicts = new WeakMap<LogEntry, boolean>()
    const matches = (entry: LogEntry) => {
        if (entry.kind === 'divider') {
            return false
        }
        if (level === 'error' && entry.level !== 'error') {
            return false
        }
        if (level === 'warn' && entry.level === undefined) {
            return false
        }
        return entry.text.toLowerCase().includes(needle)
    }
    return (entry) => {
        let verdict = verdicts.get(entry)
        if (verdict === undefined) {
            verdict = matches(entry)
            verdicts.set(entry, verdict)
        }
        return verdict
    }
}

export const visibleEntries = (entries: LogEntry[], query: string, level: LevelFilter): LogEntry[] => {
    const matcher = createMatcher(query, level)
    return matcher ? entries.filter(matcher) : entries
}

// The log's own lines, for taking out: dividers are this page's notes, not something the container wrote
export const linesText = (entries: LogEntry[]): string =>
    entries
        .filter((entry) => entry.kind === 'line')
        .map(({ text }) => text)
        .join('\n')

// A one-letter filter on long lines would otherwise make a node per letter, millions across the drawn rows
export const MAX_MARKS = 20

/* Text cut around a lower-case needle, the same plain substring visibleEntries matches: even parts are plain
 * and odd ones matched. After MAX_MARKS matches the rest stays plain. */
export const splitMatches = (text: string, needle: string): string[] => {
    if (!needle) {
        return [text]
    }
    const lower = text.toLowerCase()
    // A few characters lower-case to more than one ('İ'), and then positions in lower are off in text
    if (lower.length !== text.length) {
        return [text]
    }
    const parts: string[] = []
    let from = 0
    for (let at = lower.indexOf(needle); at !== -1 && parts.length < MAX_MARKS * 2; at = lower.indexOf(needle, from)) {
        parts.push(text.slice(from, at), text.slice(at, at + needle.length))
        from = at + needle.length
    }
    parts.push(text.slice(from))
    return parts
}

export const reconnectDivider = (before: { replica: string; restarts: number }, after: { replica: string; restarts: number }, at: Date): string | undefined => {
    if (before.replica !== after.replica) {
        return `${before.replica} was replaced · now showing ${after.replica}`
    }
    if (before.restarts !== after.restarts) {
        return `Container restarted at ${at.toTimeString().slice(0, 5)}`
    }
    return undefined
}
