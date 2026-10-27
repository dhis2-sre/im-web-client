import { LogoIconWhite } from '@dhis2/ui'
import type { FC } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/index.ts'
import styles from './layout.module.css'
import { LogoutButton } from './logout-button.tsx'
import { NotificationBell } from './notifications/notification-bell.tsx'

export const Layout: FC = () => {
    const { currentUser, isAdministrator } = useAuth()
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
                {/* New instance lives on the Instances page as its primary action, not as a button nested inside this link. */}
                <nav className={styles.navlist} aria-label="Main">
                    {/* A lone heading over the only group labels nothing, so the groups are named only when there are two. */}
                    {isAdministrator && <p className={styles.group}>Workspace</p>}
                    <NavLink to="/instances">Instances</NavLink>
                    <NavLink to="/presets">Presets</NavLink>
                    <NavLink to="/databases">Databases</NavLink>
                    {isAdministrator && (
                        <>
                            <p className={styles.group}>Administration</p>
                            <NavLink to="/stacks">Stacks</NavLink>
                            <NavLink to="/users">Users</NavLink>
                            <NavLink to="/groups">Groups</NavLink>
                            <NavLink to="/clusters">Clusters</NavLink>
                        </>
                    )}
                </nav>
                <div className={styles.navFooter}>
                    <NotificationBell />
                    {currentUser?.email && (
                        <p className={styles.identity} title={currentUser.email}>
                            <span className={styles.avatar} aria-hidden="true">
                                {currentUser.email.charAt(0).toUpperCase()}
                            </span>
                            <span className={styles.email}>{currentUser.email}</span>
                        </p>
                    )}
                    <LogoutButton />
                </div>
            </div>
            <div className={styles.mainArea}>
                <Outlet />
            </div>
        </div>
    )
}
