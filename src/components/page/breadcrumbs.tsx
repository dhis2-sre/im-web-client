import type { FC } from 'react'
import { Link } from 'react-router-dom'
import styles from './breadcrumbs.module.css'

export type Crumb = { label: string; to: string }

/* A path through real hierarchy, such as a folder in the databases tree. Not for the page header,
 * which takes a single parent link on the title's line instead. The last crumb is where the user is,
 * so it is text rather than a link to itself. */
export const Breadcrumbs: FC<{ items: Crumb[] }> = ({ items }) => (
    <nav aria-label="Breadcrumb">
        <ol className={styles.list}>
            {items.map(({ label, to }, index) => (
                <li key={to} className={styles.item}>
                    {index === items.length - 1 ? (
                        <span aria-current="page" className={styles.current}>
                            {label}
                        </span>
                    ) : (
                        <Link to={to} className={styles.link}>
                            {label}
                        </Link>
                    )}
                </li>
            ))}
        </ol>
    </nav>
)
