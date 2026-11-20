import cx from 'classnames'
import type { FC, ReactNode } from 'react'
import styles from '../styles.module.css'

/* One section of the instance form. A fieldset, so the section is a group named by its title; actions sit in
 * the header but outside the legend, so they don't become part of that name. */
export const SectionCard: FC<{ title: string; id?: string; className?: string; actions?: ReactNode; footer?: ReactNode; children: ReactNode }> = ({
    title,
    id,
    className,
    actions,
    footer,
    children,
}) => (
    <fieldset className={cx(styles.card, className)} id={id}>
        <legend className={styles.cardHeader}>{title}</legend>
        {actions && <div className={styles.cardActions}>{actions}</div>}
        <div className={styles.cardBody}>{children}</div>
        {footer}
    </fieldset>
)
