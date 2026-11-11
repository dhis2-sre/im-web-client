import { useId } from 'react'
import type { FC, ReactNode } from 'react'
import { StatusDot } from '../status/status-dot.tsx'
import type { Status } from '../status/statuses.ts'
import styles from './item-panel.module.css'
import { MetaLine } from './meta-line.tsx'
import panelStyles from './panel.module.css'

/* One of several things of a kind inside a panel, such as a stack of an instance: its name, state,
 * a few facts of its own and what can be done to it on one line, and its contents below. The body is
 * flush, since what goes there is usually a table. */
export const ItemPanel: FC<{ title: string; status?: Status; meta?: Record<string, ReactNode>; actions?: ReactNode; children?: ReactNode }> = ({
    title,
    status,
    meta,
    actions,
    children,
}) => (
    <section className={panelStyles.panel} aria-label={title}>
        <div className={styles.header}>
            <div className={styles.identity}>
                <span className={styles.name}>
                    <h3 className={styles.title}>{title}</h3>
                    {status && <StatusDot status={status} />}
                </span>
                {meta && Object.values(meta).some(Boolean) && (
                    <span className={styles.meta}>
                        <MetaLine items={meta} />
                    </span>
                )}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        {children && <div className={`${panelStyles.flushBody} ${styles.body}`}>{children}</div>}
    </section>
)

/* A titled section of item panels. The items draw their own frames, so the section adds none: a
 * frame around them would only box the boxes. Where the page has nothing else to tell them apart
 * from, the title can be hidden, staying for screen readers as the heading over the items' own. */
export const ItemPanelList: FC<{ title: string; hideTitle?: boolean; children: ReactNode }> = ({ title, hideTitle, children }) => {
    const titleId = useId()

    return (
        <section className={styles.list} aria-labelledby={titleId}>
            <h2 id={titleId} className={hideTitle ? 'visually-hidden' : styles.listTitle}>
                {title}
            </h2>
            {children}
        </section>
    )
}
