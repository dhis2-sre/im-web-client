import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { LEVEL_SEARCH_CHARS, LEVEL_WORD, splitMatches } from './log-lines.ts'
import type { LogEntry } from './log-lines.ts'
import styles from './log-panel.module.css'

/* Matches are found across the whole line, so one running into or out of the level word still shows, and the
 * word's share of each piece is then set bold. At most MAX_MARKS marks. */
const highlight = (text: string, needle: string, word?: { start: number; end: number }): ReactNode[] => {
    const nodes: ReactNode[] = []
    let at = 0
    splitMatches(text, needle).forEach((part, i) => {
        const from = at
        at += part.length
        const cuts = word ? [from, Math.min(Math.max(word.start, from), at), Math.min(Math.max(word.end, from), at), at] : [from, at]
        for (let c = 0; c < cuts.length - 1; c++) {
            if (cuts[c] === cuts[c + 1]) {
                continue
            }
            const piece = text.slice(cuts[c], cuts[c + 1])
            const key = `${i}.${c}`
            const inner = i % 2 ? <mark key={key}>{piece}</mark> : piece
            nodes.push(
                word && cuts[c] >= word.start && cuts[c + 1] <= word.end ? (
                    <b key={key} className={styles.word}>
                        {inner}
                    </b>
                ) : (
                    inner
                )
            )
        }
    })
    return nodes
}

/* No handlers, and memoised on the entry object, which the stream never changes once made, so an update
 * renders only the rows it added rather than all 2,000. */
const LogRowView: FC<{ entry: LogEntry; needle: string }> = ({ entry, needle }) => {
    if (entry.kind === 'divider') {
        return (
            <div data-log-row className={styles.divider}>
                {entry.text}
            </div>
        )
    }
    // A line with a level got it from this word, or carries it on from the line above and has none
    const word = entry.level && LEVEL_WORD.exec(entry.text.slice(0, LEVEL_SEARCH_CHARS))
    return (
        <div data-log-row className={entry.level ? `${styles.line} ${entry.level === 'error' ? styles.err : styles.warn}` : styles.line}>
            {highlight(entry.text, needle, word ? { start: word.index, end: word.index + word[0].length } : undefined)}
        </div>
    )
}
export const LogRow = memo(LogRowView)
