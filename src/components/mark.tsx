import type { FC } from 'react'
import styles from './mark.module.css'

/* "IM" in ASCII is 0x49 0x4D: written four bits to a row, the ones are the lit dots of the 4×4 grid. */
const BITS = '0100100101001101'
const ACCENT = 1
const DOTS = [...BITS].map((bit, i) => ({
    id: `${i % 4},${Math.floor(i / 4)}`,
    col: i % 4,
    row: Math.floor(i / 4),
    kind: i === ACCENT ? 'accent' : bit === '1' ? 'lit' : 'unlit',
    /* Where this dot comes in the typing order, I then M; unlit dots have none. */
    order: bit === '1' ? BITS.slice(0, i).split('1').length - 1 : -1,
}))

/* Each size is drawn on whole pixels so the dots stay crisp on 1x screens: an even cell takes an even dot, an odd cell an odd one. */
const DOT = { 16: 2, 20: 3, 32: 4 } as const

/* busy: the lit dots dim and relight in typing order, so the mark works as a loader. */
type MarkProps = { size: keyof typeof DOT; onDark?: boolean; busy?: boolean; className?: string }

/* The Instance Manager mark. Dots take currentColor; only the top dot, where an i's dot would sit, is blue. */
export const Mark: FC<MarkProps> = ({ size, onDark = false, busy = false, className }) => {
    const cell = size / 4
    return (
        <svg
            className={[styles.mark, onDark ? styles.onDark : '', busy ? styles.busy : '', className].filter(Boolean).join(' ')}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
        >
            {DOTS.map((dot) => (
                <circle
                    key={dot.id}
                    className={dot.kind === 'lit' ? undefined : styles[dot.kind]}
                    cx={dot.col * cell + cell / 2}
                    cy={dot.row * cell + cell / 2}
                    r={DOT[size] / 2}
                    style={busy && dot.order >= 0 ? { animationDelay: `${dot.order * 110}ms` } : undefined}
                />
            ))}
        </svg>
    )
}
