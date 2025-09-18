import { LogoIconWhite, IconAdd16, Tooltip } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/index.ts'
import styles from './layout.module.css'
import { LogoutButton } from './logout-button.tsx'

export const Layout: FC = () => {
    const navigate = useNavigate()
    const { isAdministrator } = useAuth()
    const location = useLocation()
    const toNewDhis2Instance = useCallback(
        (event) => {
            event.stopPropagation()
            event.preventDefault()
            navigate('/instances/new')
        },
        [navigate]
    )

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
                    <NavLink to="/instances">
                        Instances
                        <Tooltip content="Create new DHIS2 Core instance">
                            <button onClick={toNewDhis2Instance} className={styles.toNewDhis2Instance}>
                                <IconAdd16 />
                            </button>
                        </Tooltip>
                    </NavLink>
                    <NavLink to="/databases">Databases</NavLink>
                    {isAdministrator && (
                        <>
                            <NavLink to="/stacks">Stacks</NavLink>
                            <NavLink to="/users">Users</NavLink>
                            <NavLink to="/groups">Groups</NavLink>
                            <NavLink to="/clusters">Clusters</NavLink>
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
