import type { FC } from 'react'
import styles from './status-dot.module.css'
import type { Status } from './statuses.ts'

/* A status as a coloured dot beside a name, where the page spells it out further down and the name
 * only needs to catch the eye. The label is its tooltip and accessible name. */
export const StatusDot: FC<{ status: Status }> = ({ status }) => (
    <span className={`${styles.dot} ${styles[status.tone]}`} title={status.detail ? `${status.label}: ${status.detail}` : status.label}>
        <span className="visually-hidden">{status.label}</span>
    </span>
)
