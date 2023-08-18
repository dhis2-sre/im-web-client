import { LogoIconWhite } from '@dhis2/ui'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogoutButton } from './logout-button'
import styles from './layout.module.css'
import type { FC } from 'react'
import { useAuth } from '../hooks'

export const Layout: FC = () => {
    const { isAdministrator } = useAuth()
    const location = useLocation()

    if (location.pathname === '/') {
        return <Navigate to="/instances" />
    }

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <h1 className={styles.header}>
                    <LogoIconWhite className={styles.logo} />
                    Instance Manager
                </h1>
                <nav className={styles.navlist}>
                    <NavLink to="/instances">Instances</NavLink>
                    <NavLink to="/databases">Databases</NavLink>
                    <NavLink to="/stacks">Stacks</NavLink>
                    {isAdministrator && (
                        <>
                            <NavLink to="/users">Users</NavLink>
                            <NavLink to="/groups">Groups</NavLink>
                        </>
                    )}
                </nav>
                <LogoutButton />
            </div>
            <div className={styles.mainArea}>
                <Outlet />
            </div>
        </div>
    )
}
