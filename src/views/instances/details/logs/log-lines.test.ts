import {
    appendCapped,
    MAX_MARKS,
    createLineSplitter,
    dropOverlap,
    levelOf,
    linesText,
    reconnectDivider,
    splitMatches,
    toEntries,
    visibleEntries,
    type LogEntry,
} from './log-lines.ts'

const lines = (texts: string[], firstId = 0): LogEntry[] => texts.map((text, i) => ({ id: firstId + i, kind: 'line', text, level: undefined }))

describe('levelOf', () => {
    it('levelOf finds DHIS2, logback and Postgres levels', () => {
        expect(levelOf(' * ERROR 2026-11-03T10:14:26,774 boom', undefined)).toBe('error')
        expect(levelOf('WARN  org.hibernate.X - y', undefined)).toBe('warn')
        expect(levelOf('ERROR:  relation "x" does not exist', undefined)).toBe('error')
        expect(levelOf('WARNING:  y', undefined)).toBe('warn')
        expect(levelOf('2026-11-03T10:14:26Z FATAL x', undefined)).toBe('error')
        expect(levelOf('SEVERE: x', undefined)).toBe('error')
        expect(levelOf(' * INFO  x', undefined)).toBeUndefined()
    })

    it('levelOf ignores a level word deep in the message', () => {
        expect(levelOf(' * INFO  user typed ERROR in a field', undefined)).toBeUndefined()
    })

    it('levelOf carries the level onto continuation lines', () => {
        expect(levelOf('\tat org.x.Y(Y.java:1)', 'error')).toBe('error')
        expect(levelOf('    at x', 'error')).toBe('error')
        expect(levelOf('Caused by: java.io.IOException: x', 'error')).toBe('error')
        expect(levelOf('org.postgresql.util.PSQLException: ERROR: x', 'error')).toBe('error')
        expect(levelOf(' * INFO  next', 'error')).toBeUndefined()
        expect(levelOf('', 'error')).toBe('error')
    })
})

describe('toEntries', () => {
    it('numbers entries from firstId and carries the level', () => {
        expect(toEntries(['ERROR x', '\tat y', 'INFO z'], undefined, 7)).toEqual([
            { id: 7, kind: 'line', text: 'ERROR x', level: 'error' },
            { id: 8, kind: 'line', text: '\tat y', level: 'error' },
            { id: 9, kind: 'line', text: 'INFO z', level: undefined },
        ])
    })
})

describe('createLineSplitter', () => {
    it('splitter holds a partial line until the rest arrives', () => {
        const s = createLineSplitter()
        expect(s.push('a\nb')).toEqual(['a'])
        expect(s.push('c\nd\n')).toEqual(['bc', 'd'])
    })

    it('splitter strips CR', () => {
        expect(createLineSplitter().push('a\r\nb\r\n')).toEqual(['a', 'b'])
    })

    it('splitter flushes a last line with no newline', () => {
        const s = createLineSplitter()
        s.push('a\nb')
        expect(s.flush()).toEqual(['b'])
        expect(s.flush()).toEqual([])
    })

    it('splitter cuts a long line', () => {
        expect(createLineSplitter(10).push('x'.repeat(25) + '\n')).toEqual(['xxxxxxxxxx… [15 more characters]'])
    })

    it('splitter never holds more than the limit of an unfinished line', () => {
        const s = createLineSplitter(10)
        expect(s.push('y'.repeat(8))).toEqual([])
        expect(s.push('y'.repeat(1_000_000))).toEqual([])
        expect(s.push('tail\nnext\n')).toEqual(['yyyyyyyyyy… [1000002 more characters]', 'next'])
    })
})

describe('appendCapped', () => {
    it('appendCapped drops the oldest beyond the line cap', () => {
        const result = appendCapped(lines(['1', '2', '3']), lines(['4', '5'], 3), { lines: 4 })
        expect(result.entries).toHaveLength(4)
        expect(result.entries[0].text).toBe('2')
        expect(result.dropped).toBe(1)
    })

    it('appendCapped drops the oldest beyond the character cap', () => {
        const ten = 'x'.repeat(10)
        const result = appendCapped(lines([ten, ten, ten]), lines([ten], 3), { chars: 25 })
        expect(result.entries).toHaveLength(2)
        expect(result.dropped).toBe(2)
    })

    it('appendCapped caps what is added alone', () => {
        const result = appendCapped([], lines(Array.from({ length: 15_000 }, (_, i) => String(i))))
        expect(result.entries).toHaveLength(10_000)
        expect(result.dropped).toBe(5000)
    })
})

describe('dropOverlap', () => {
    it('dropOverlap skips lines already held', () => {
        expect(dropOverlap(lines(['a', 'b', 'c']), ['b', 'c', 'd', 'e'])).toEqual({ lines: ['d', 'e'], found: true })
    })

    it('dropOverlap matches the last three held lines, not one repeated line', () => {
        expect(dropOverlap(lines(['x', 'ok', 'ok']), ['ok', 'ok', 'x', 'ok', 'ok', 'n']).lines).toEqual(['n'])
    })

    it('dropOverlap uses the first occurrence so repeated lines never swallow new ones', () => {
        const h = ['h', 'h', 'h']
        expect(dropOverlap(lines(h), [...h, 'ERROR x', ...h, 'y']).lines).toEqual(['ERROR x', 'h', 'h', 'h', 'y'])
    })

    it('dropOverlap ignores a trailing divider in the held entries', () => {
        const held: LogEntry[] = [...lines(['a', 'b']), { id: 2, kind: 'divider', text: 'Reconnected' }]
        expect(dropOverlap(held, ['a', 'b', 'c'])).toEqual({ lines: ['c'], found: true })
    })

    it('dropOverlap reports no match', () => {
        expect(dropOverlap(lines(['a']), ['z'])).toEqual({ lines: ['z'], found: false })
    })
})

describe('visibleEntries', () => {
    it('visibleEntries filters literally and case-insensitively', () => {
        const entries = lines(['xa.bx', 'aXb'])
        expect(visibleEntries(entries, 'A.B', 'all').map((e) => e.text)).toEqual(['xa.bx'])
        expect(() => visibleEntries(entries, '(', 'all')).not.toThrow()
    })

    it('visibleEntries applies the level chip', () => {
        const entries: LogEntry[] = [
            { id: 0, kind: 'line', text: 'i', level: undefined },
            { id: 1, kind: 'line', text: 'w', level: 'warn' },
            { id: 2, kind: 'line', text: 'e', level: 'error' },
            { id: 3, kind: 'divider', text: 'd' },
        ]
        expect(visibleEntries(entries, '', 'all')).toHaveLength(4)
        expect(visibleEntries(entries, '', 'warn').map((e) => e.text)).toEqual(['w', 'e'])
        expect(visibleEntries(entries, '', 'error').map((e) => e.text)).toEqual(['e'])
        expect(visibleEntries(entries, 'd', 'all')).toEqual([])
    })
})

describe('reconnectDivider', () => {
    it('reconnectDivider names a restart', () => {
        const at = new Date(2026, 10, 3, 10, 52)
        expect(reconnectDivider({ replica: 'a', restarts: 3 }, { replica: 'a', restarts: 4 }, at)).toBe('Container restarted at 10:52')
    })

    it('reconnectDivider names a replaced replica', () => {
        expect(reconnectDivider({ replica: 'a', restarts: 0 }, { replica: 'b', restarts: 0 }, new Date())).toBe('a was replaced · now showing b')
    })

    it('reconnectDivider is quiet when nothing changed', () => {
        expect(reconnectDivider({ replica: 'a', restarts: 3 }, { replica: 'a', restarts: 3 }, new Date())).toBeUndefined()
    })
})

describe('splitMatches', () => {
    it('splitMatches marks every match, case-insensitively', () => {
        expect(splitMatches('Error: an error', 'error')).toEqual(['', 'Error', ': an ', 'error', ''])
    })

    it('splitMatches leaves text plain without a needle', () => {
        expect(splitMatches('abc', '')).toEqual(['abc'])
    })

    it('splitMatches stops marking after MAX_MARKS, keeping the rest as plain text', () => {
        const parts = splitMatches('a'.repeat(5000), 'a')
        expect(parts.length).toBeLessThanOrEqual(MAX_MARKS * 2 + 1)
        expect(parts.join('')).toBe('a'.repeat(5000))
    })
})

describe('splitMatches with lower-casing that changes length', () => {
    it('leaves the line unmarked rather than marking the wrong characters', () => {
        expect(splitMatches('İstanbul error', 'error')).toEqual(['İstanbul error'])
    })
})

describe('linesText', () => {
    it('leaves dividers out', () => {
        const entries: LogEntry[] = [
            { id: 0, kind: 'line', text: 'a', level: undefined },
            { id: 1, kind: 'divider', text: 'Reconnected' },
            { id: 2, kind: 'line', text: 'b', level: undefined },
        ]
        expect(linesText(entries)).toBe('a\nb')
    })
})
