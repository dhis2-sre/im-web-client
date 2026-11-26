import { Card } from '@dhis2/ui'
import type { FC, FormEvent, ReactNode } from 'react'
import styles from './auth-card.module.css'
import { AuthHeading } from './auth-heading.tsx'

type AuthCardProps = {
    heading: ReactNode
    onSubmit: (event: FormEvent) => void
    footer?: ReactNode
    children: ReactNode
}

/* The frame every logged-out page shares: the lockup card on a faint dot grid, with an optional line under it. */
export const AuthCard: FC<AuthCardProps> = ({ heading, onSubmit, footer, children }) => {
    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <div className={styles.cardWrap}>
                <Card className={styles.box}>
                    <AuthHeading>{heading}</AuthHeading>
                    <div className={styles.fields}>{children}</div>
                </Card>
            </div>
            {footer && <p className={styles.footer}>{footer}</p>}
        </form>
    )
}
