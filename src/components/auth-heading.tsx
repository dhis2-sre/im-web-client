import type { FC, ReactNode } from 'react'
import styles from './auth-heading.module.css'
import { Mark } from './mark.tsx'

/* The full lockup over an auth card, the one place it gets room; the card's own heading sits under it as a quiet line. */
export const AuthHeading: FC<{ children: ReactNode }> = ({ children }) => (
    <div className={styles.head}>
        <div className={styles.lockup}>
            <Mark size={32} />
            Instance Manager
        </div>
        <h2 className={styles.title}>{children}</h2>
    </div>
)
