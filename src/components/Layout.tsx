import { LogoIconWhite } from '@dhis2/ui'
import { RequireAuth, useIsAuthenticated } from 'react-auth-kit'
import { Navigate, Outlet, useLocation } from 'react-router'
import styles from './Layout.module.css'
import { NavLink } from 'react-router-dom'
import StackSubNav from './StacksSubNav'
import { LogoutButton } from './LogoutButton'

export const Layout = () => {
    const location = useLocation()
    const isAuthenticated = useIsAuthenticated()

    if (!isAuthenticated()) {
        return <Navigate to="/login" />
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
                        <NavLink to="/stacks" end>
                            Stacks
                        </NavLink>
                        <StackSubNav />
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
