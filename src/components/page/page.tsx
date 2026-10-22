import type { FC, ReactNode } from 'react'
import { NonIdealState } from '../states/non-ideal-state.tsx'
import { Breadcrumbs } from './breadcrumbs.tsx'
import type { Crumb } from './breadcrumbs.tsx'
import styles from './page.module.css'

type PageHeaderProps = {
    title: string
    breadcrumbs?: Crumb[]
    /* A line under the title for what describes the page as a whole, such as a description. */
    meta?: ReactNode
    actions?: ReactNode
}

export const PageHeader: FC<PageHeaderProps> = ({ title, breadcrumbs, meta, actions }) => (
    <header className={styles.header}>
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        {meta && <div className={styles.meta}>{meta}</div>}
    </header>
)

export type PageError = { title: string; description?: ReactNode }

/* The scaffold of an authenticated screen. The header always renders, so a page keeps its title and
 * its way back while its data loads or fails, and only the body is swapped for that state. Pass
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
