import { CircularLoader, IconEmptyFrame24, IconErrorFilled24, IconLock24 } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import styles from './non-ideal-state.module.css'

export type NonIdealStateVariant = 'loading' | 'empty' | 'error' | 'forbidden'

const ICONS = {
    empty: IconEmptyFrame24,
    error: IconErrorFilled24,
    forbidden: IconLock24,
}

/* What a page, panel or table shows instead of its content: while it loads, when there is nothing,
 * when it failed and when the user may not see it. It sits where the content would be, so whatever
 * frames the content, such as a page header or a panel title, stays in place. */
export const NonIdealState: FC<{ variant: NonIdealStateVariant; title: string; description?: ReactNode; action?: ReactNode; dataTest?: string }> = ({
    variant,
    title,
    description,
    action,
    dataTest,
}) => {
    const Icon = variant === 'loading' ? undefined : ICONS[variant]

    return (
        <div className={styles.state} role={variant === 'error' ? 'alert' : 'status'} data-test={dataTest}>
            {/* The icon takes its colour from the wrapper, since an SVG fill attribute cannot read a CSS variable. */}
            <span className={variant === 'error' ? styles.errorIcon : styles.icon}>{Icon ? <Icon color="currentColor" /> : <CircularLoader small />}</span>
            <p className={styles.title}>{title}</p>
            {description && <p className={styles.description}>{description}</p>}
            {action && <div className={styles.action}>{action}</div>}
        </div>
    )
}
