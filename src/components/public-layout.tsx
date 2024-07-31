import { LogoIconWhite } from '@dhis2/ui'
import type { FC } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
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
                    <LogoIconWhite className={styles.logo} />
                    Instance Manager
                </h1>
                <nav className={styles.navlist}>
                    <NavLink to="/play/instances">
                        View Public Instances
                    </NavLink>
                    <NavLink to="/play/databases">View Public Databases</NavLink>
                    <NavLink to="/sign-in">Login</NavLink>
                    <NavLink to="/sign-up">Signup</NavLink>
                </nav>
            </div>
            <div className={styles.mainArea}>
                <Outlet />
            </div>
        </div>
    )
}
