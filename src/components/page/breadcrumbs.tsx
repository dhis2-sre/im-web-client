import type { FC } from 'react'
import { Link } from 'react-router-dom'
import styles from './breadcrumbs.module.css'

export type Crumb = { label: string; to: string }

/* The way back up from a page, one level per crumb. The current page is not repeated here, since the
 * title right below names it. */
export const Breadcrumbs: FC<{ items: Crumb[] }> = ({ items }) => (
    <nav aria-label="Breadcrumb">
        <ol className={styles.list}>
            {items.map(({ label, to }) => (
                <li key={to} className={styles.item}>
                    <Link to={to} className={styles.link}>
                        {label}
                    </Link>
                </li>
            ))}
        </ol>
    </nav>
)
