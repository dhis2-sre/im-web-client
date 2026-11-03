import { memo } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './log-drawer.module.css'
import { LEVEL_SEARCH_CHARS, LEVEL_WORD } from './log-lines.ts'
import type { LogEntry } from './log-lines.ts'

// Plain substring, case-insensitive, the same match visibleEntries filters on
const highlight = (text: string, needle: string): ReactNode => {
    if (!needle) {
        return text
    }
    const lower = text.toLowerCase()
    const parts: ReactNode[] = []
    let from = 0
    for (let at = lower.indexOf(needle); at !== -1; at = lower.indexOf(needle, from)) {
        parts.push(text.slice(from, at), <mark key={at}>{text.slice(at, at + needle.length)}</mark>)
        from = at + needle.length
    }
    parts.push(text.slice(from))
    return parts
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
