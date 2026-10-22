import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { NonIdealState } from '../states/non-ideal-state.tsx'
import styles from './page.module.css'

type PageHeaderProps = {
    /* Left out while a details page has not loaded the name it shows, rather than standing in a
     * generic word for it. The parent link and its slash stay and the row keeps its height, so
     * nothing jumps when the name arrives. */
    title?: string
    /* How many things a list page shows, after any filters, next to its title. */
    count?: number
    /* The list a details page belongs to, shown as a quiet link ahead of the title on the same line. */
    parent?: { label: string; to: string }
    actions?: ReactNode
}

/* The parent link sits beside the heading rather than inside it, so the heading's accessible name is
 * the entity alone. It reads as one line with the title, but stays put while a long title wraps. */
export const PageHeader: FC<PageHeaderProps> = ({ title, count, parent, actions }) => {
    /* A name that arrives after the page opened fades in, so it reads as the page finishing loading.
     * A title that is there from the start just shows. */
    const [arrives] = useState(title === undefined)
    const arrival = arrives ? ` ${styles.arrival}` : ''

    return (
        <header className={styles.header}>
            <div className={styles.titleRow}>
                <div className={styles.heading}>
                    {parent && (
                        <span className={styles.parent}>
                            <Link to={parent.to} className={styles.parentLink}>
                                {parent.label}
                            </Link>
                            <span className={styles.separator} aria-hidden="true">
                                /
                            </span>
                        </span>
                    )}
                    {title && (
                        <h1 className={`${styles.title}${arrival}`}>
                            {title}
                            {count !== undefined && <span className={styles.count}> ({count})</span>}
                        </h1>
                    )}
                </div>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
        </header>
    )
}

export type PageError = { title: string; description?: ReactNode }

/* The scaffold of an authenticated screen. The header always renders, so a page keeps its place
 * while its data loads or fails, and only the body is swapped for that state. Pass
 * loading only while there is nothing to show yet: a refetch behind data already on screen should
 * not blank the page. */
export const Page: FC<PageHeaderProps & { loading?: boolean; error?: PageError; children?: ReactNode }> = ({ loading, error, children, ...header }) => (
    <div className={styles.page}>
        <PageHeader {...header} />
        {loading && <NonIdealState variant="loading" title="Loading…" />}
        {!loading && error && <NonIdealState variant="error" title={error.title} description={error.description} />}
        {!loading && !error && children}
    </div>
)
