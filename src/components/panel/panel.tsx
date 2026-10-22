import { useId } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './panel.module.css'

/* A titled section of a page, the unit details pages are built from. Flush drops the body's padding
 * for content that brings its own edges, such as a table. */
export const Panel: FC<{ title: string; count?: number; actions?: ReactNode; flush?: boolean; children?: ReactNode }> = ({ title, count, actions, flush, children }) => {
    const titleId = useId()

    return (
        <section className={styles.panel} aria-labelledby={titleId}>
            <div className={styles.header}>
                <h2 id={titleId} className={styles.title}>
                    {title}
                    {count !== undefined && <span className={styles.count}> ({count})</span>}
                </h2>
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
            <div className={flush ? styles.flushBody : styles.body}>{children}</div>
        </section>
    )
}
