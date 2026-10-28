import { Fragment } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './meta-line.module.css'

/* A few facts read as one sentence, split by dots, where labelled fields would be heavier than the
 * facts themselves. Each fact keeps together and the line wraps between them. Size and colour come
 * from where it is used. Facts are named, which keys them, and read in the order given; a falsy one
 * is skipped, so a fact can be included with a plain condition. */
export const MetaLine: FC<{ items: Record<string, ReactNode> }> = ({ items }) => (
    <span className={styles.line}>
        {Object.entries(items)
            .filter(([, item]) => Boolean(item))
            .map(([key, item], index) => (
                <Fragment key={key}>
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
