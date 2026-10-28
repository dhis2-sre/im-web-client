import type { FC, ReactNode } from 'react'
import styles from './meta-line.module.css'

/* A few facts on one line, where labelled fields would be heavier than the facts themselves. Each
 * leads with its icon, which is what sets one apart from the next, so they are spaced rather than
 * split by dots. Each fact keeps together and the line wraps between them. Size and colour come from
 * where it is used. Facts are named, which keys them, and read in the order given; a falsy one is
 * skipped, so a fact can be included with a plain condition. */
export const MetaLine: FC<{ items: Record<string, ReactNode> }> = ({ items }) => (
    <span className={styles.line}>
        {Object.entries(items)
            .filter(([, item]) => Boolean(item))
            .map(([key, item]) => (
                <span key={key} className={styles.item}>
                    {item}
                </span>
            ))}
    </span>
)

/* A fact led by a small icon, which says at a glance what kind of fact it is. The icon is decoration
 * for screen readers, so the fact's own words still have to name it where that matters. */
export const MetaFact: FC<{ icon: ReactNode; children: ReactNode }> = ({ icon, children }) => (
    <>
        <span className={styles.icon} aria-hidden="true">
            {icon}
        </span>
        {children}
    </>
)
