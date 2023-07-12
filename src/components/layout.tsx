import { LogoIconWhite } from '@dhis2/ui'
import { useNavigate, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogoutButton } from './logout-button'
import { isLoggedIn } from 'axios-jwt'
import styles from './layout.module.css'
import { useEffect } from 'react'
import { UNAUTHORIZED_EVENT } from '../hooks/use-auth-axios'

export const Layout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const navigateToLogin = (event) => navigate('/login', { state: { referrerPath: event.detail } })
        window.addEventListener(UNAUTHORIZED_EVENT, navigateToLogin, false)

        return () => {
            window.removeEventListener(UNAUTHORIZED_EVENT, navigateToLogin, false)
        }
    }, [navigate])

    if (!isLoggedIn()) {
        return <Navigate to="/login" state={{ referrerPath: location.pathname }} />
    }

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
    )
}
