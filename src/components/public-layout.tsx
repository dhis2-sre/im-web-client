import { LogoIcon } from '@dhis2/ui'
import type { FC } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import styles from './public-layout.module.css'

export const PublicLayout: FC = () => {
    const location = useLocation()

    if (location.pathname === '/') {
        return <Navigate to="/sign-in" />
    }

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <h1 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    DHIS2 Playground
                </h1>
            </div>
            <div className={styles.mainArea}>
                <Outlet />
            </div>
        </div>
    )
}
