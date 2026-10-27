import { Fragment } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './meta-line.module.css'

/* A few facts read as one sentence, split by dots, where labelled fields would be heavier than the
 * facts themselves. Each fact keeps together and the line wraps between them. Size and colour come
 * from where it is used. */
export const MetaLine: FC<{ items: ReactNode[] }> = ({ items }) => (
    <span className={styles.line}>
        {items.map((item, index) => (
            // The facts are a fixed list read in order, so their position is their identity.
            // oxlint-disable-next-line react/no-array-index-key
            <Fragment key={index}>
                {index > 0 && (
                    <span className={styles.separator} aria-hidden="true">
                        ·
                    </span>
                )}
                <span className={styles.item}>{item}</span>
            </Fragment>
        ))}
    </span>
)
