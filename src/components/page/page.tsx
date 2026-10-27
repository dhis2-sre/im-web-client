import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { NonIdealState } from '../states/non-ideal-state.tsx'
import { StatusDot } from '../status/status-dot.tsx'
import type { Status } from '../status/statuses.ts'
import styles from './page.module.css'

type PageHeaderProps = {
    /* Left out while a details page has not loaded the name it shows, rather than standing in a
     * generic word for it. The parent link and its slash stay and the row keeps its height, so
     * nothing jumps when the name arrives. */
    title?: string
    /* The list a details page belongs to, shown as a quiet link on a line above the title. */
    parent?: { label: string; to: string }
    /* The state of the whole entity, as a dot beside its name. */
    status?: Status
    /* What the entity is for, in its owner's words, as a line under the title. */
    description?: string
    actions?: ReactNode
    /* Facts about the entity, straight under the header. */
    summary?: ReactNode
    /* The header and facts on a white band across the top, for a details page. Set from the start
     * rather than once the facts arrive, so the band is there while the page loads. */
    band?: boolean
}

/* The parent link sits outside the heading, so the heading's accessible name is the entity alone.
 * On a band the name and actions stay pinned to the top while the page scrolls, and the rest of the
 * band slides away under them. */
export const PageHeader: FC<PageHeaderProps> = ({ title, parent, status, description, actions, summary, band }) => {
    /* A name that arrives after the page opened fades in, so it reads as the page finishing loading.
     * A title that is there from the start just shows. */
    const [arrives] = useState(title === undefined)
    const arrival = arrives ? ` ${styles.arrival}` : ''

    const below = (
        <>
            {description && <p className={styles.description}>{description}</p>}
            {summary && <div className={styles.summary}>{summary}</div>}
        </>
    )

    return (
        <header className={band ? styles.bandHeader : styles.header}>
            {parent && (
                <div className={band ? `${styles.strip} ${styles.stripTop}` : undefined}>
                    <span className={styles.parent}>
                        <Link to={parent.to} className={styles.parentLink}>
                            {parent.label}
                        </Link>
                        <span aria-hidden="true">/</span>
                    </span>
                </div>
            )}
            <div className={band ? `${styles.titleRow} ${styles.strip} ${styles.pinned}` : styles.titleRow}>
                <div className={styles.heading}>
                    {title && <h1 className={`${styles.title}${arrival}`}>{title}</h1>}
                    {status && <StatusDot status={status} />}
                </div>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
            {band ? <div className={`${styles.strip} ${styles.stripBottom}`}>{below}</div> : below}
        </header>
    )
}

export type PageError = { title: string; description?: ReactNode }

/* The scaffold of an authenticated screen. The header always renders, so a page keeps its place
 * while its data loads or fails, and only the body is swapped for that state. Pass
 * loading only while there is nothing to show yet: a refetch behind data already on screen should
 * not blank the page. */
type PageProps = PageHeaderProps & {
    loading?: boolean
    error?: PageError
    children?: ReactNode
}

export const Page: FC<PageProps> = ({ loading, error, summary, children, ...header }) => {
    const ready = !loading && !error

    return (
        <div className={`${styles.page}${header.band ? ` ${styles.banded}` : ''}`}>
            <PageHeader {...header} summary={ready ? summary : undefined} />
            <div className={styles.body}>
                {loading && <NonIdealState variant="loading" title="Loading…" />}
                {!loading && error && <NonIdealState variant="error" title={error.title} description={error.description} />}
                {ready && children}
            </div>
        </div>
    )
}
