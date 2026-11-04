import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import { LEVEL_SEARCH_CHARS, LEVEL_WORD, splitMatches } from './log-lines.ts'
import type { LogEntry } from './log-lines.ts'
import styles from './log-panel.module.css'

// At most MAX_MARKS per piece, and a row has at most three: before its level word, the word, and after
const highlight = (text: string, needle: string): ReactNode => splitMatches(text, needle).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))

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
    const end = word ? word.index + word[0].length : 0
    return (
        <div data-log-row className={entry.level ? `${styles.line} ${entry.level === 'error' ? styles.err : styles.warn}` : styles.line}>
            {word ? (
                <>
                    {highlight(entry.text.slice(0, word.index), needle)}
                    <b className={styles.word}>{highlight(word[0], needle)}</b>
                    {highlight(entry.text.slice(end), needle)}
                </>
            ) : (
                highlight(entry.text, needle)
            )}
        </div>
    )
}
export const LogRow = memo(LogRowView)
