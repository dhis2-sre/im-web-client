import type { FC, ReactNode } from 'react'
import styles from './key-value-grid.module.css'

export type KeyValueItem = { label: string; value: ReactNode }

/* Labelled values laid out in as many columns as fit, for the summary at the top of a details page. */
export const KeyValueGrid: FC<{ items: KeyValueItem[] }> = ({ items }) => (
    <dl className={styles.grid}>
        {items.map(({ label, value }) => (
            <div key={label} className={styles.item}>
                <dt className={styles.label}>{label}</dt>
                <dd className={styles.value}>{value}</dd>
            </div>
        ))}
    </dl>
)
