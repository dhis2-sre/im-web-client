import { IconAdd16, IconApps16, IconArchive16, IconDuplicate16, IconLayoutRows16, IconTerminalWindow16, IconUser16, IconUserGroup16, LogoIconWhite } from '@dhis2/ui'
import type { FC } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/index.ts'
import styles from './layout.module.css'
import { NotificationBell } from './notifications/notification-bell.tsx'
import { UserMenu } from './user-menu.tsx'

export const Layout: FC = () => {
    const { currentUser, isAdministrator } = useAuth()
    const location = useLocation()

    if (location.pathname === '/') {
        return <Navigate to="/instances" />
    }

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                {/* The product's name, not a heading: each page titles itself with the one h1. */}
                <div className={styles.header}>
                    <LogoIconWhite className={styles.logo} />
                    Instance Manager
                </div>
                <nav className={styles.navlist} aria-label="Main">
                    {/* The + sits beside the link, not inside it: a link can't contain another link or a button. */}
                    <div className={styles.navRow}>
                        <NavLink to="/instances">
                            <IconTerminalWindow16 />
                            Instances
                        </NavLink>
                        <Link to="/instances/new" className={styles.navAction} aria-label="New instance" title="New instance">
                            <IconAdd16 />
                        </Link>
                    </div>
                    <NavLink to="/presets">
                        <IconDuplicate16 />
                        Presets
                    </NavLink>
                    <NavLink to="/databases">
                        <IconArchive16 />
                        Databases
                    </NavLink>
                    {isAdministrator && (
                        <>
                            <hr className={styles.divider} />
                            <NavLink to="/stacks">
                                <IconLayoutRows16 />
                                Stacks
                            </NavLink>
                            <NavLink to="/users">
                                <IconUser16 />
                                Users
                            </NavLink>
                            <NavLink to="/groups">
                                <IconUserGroup16 />
                                Groups
                            </NavLink>
                            <NavLink to="/clusters">
                                <IconApps16 />
                                Clusters
                            </NavLink>
                        </>
                    )}
                </nav>
                <div className={styles.navFooter}>
                    {/* Falls back to a label rather than hiding the row, which is the only way to log out. */}
                    <UserMenu email={currentUser?.email ?? 'Account'} />
                    <NotificationBell />
                </div>
            </div>
            <div className={styles.mainArea}>
                <Outlet />
            </div>
        </div>
    )
}
