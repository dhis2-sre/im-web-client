import { LogoIconWhite } from '@dhis2/ui'
import { RequireAuth, useIsAuthenticated } from 'react-auth-kit'
import { Outlet, useLocation, useNavigate } from 'react-router'
import styles from './Layout.module.css'
import { NavLink } from 'react-router-dom'
import StackSubNav from './StacksSubNav'
import { LogoutButton } from './LogoutButton'
import { useEffect } from 'react'

export const Layout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const isAuthenticatedFn = useIsAuthenticated()
    const isAtHomePage = location.pathname === '/'
    const isAuthenticated = isAuthenticatedFn()

    useEffect(() => {
        if (isAtHomePage) {
            if (isAuthenticated) {
                navigate('/instances')
            } else {
                navigate('/login')
            }
        }
    }, [isAtHomePage, isAuthenticated, navigate])

    if (!isAuthenticated) {
        return null
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
