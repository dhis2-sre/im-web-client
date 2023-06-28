import { LogoIconWhite } from '@dhis2/ui'
import { RequireAuth, useIsAuthenticated } from 'react-auth-kit'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'
import { LogoutButton } from './LogoutButton'

export const Layout = () => {
    const location = useLocation()
    const isAuthenticated = useIsAuthenticated()

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ redirectPath: location.pathname }} />
    }

    if (location.pathname === '/') {
        return <Navigate to="/instances" />
    }

    return (
        <RequireAuth loginPath={'/login'}>
            <div className={styles.container}>
                <div className={styles.nav}>
                    <h1 className={styles.header}>
                        <LogoIconWhite className={styles.logo} />
                        Instance Manager
                    </h1>
                    <nav className={styles.navlist}>
                        <NavLink to="/instances">Instances</NavLink>
                        <NavLink to="/databases">Databases</NavLink>
                        <NavLink to="/stacks" end>
                            Stacks
                        </NavLink>
                    </nav>
                    <LogoutButton />
                </div>
                <div className={styles.mainArea}>
                    <Outlet />
                </div>
            </div>
        </RequireAuth>
    )
}
