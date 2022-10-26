import { LogoIconWhite } from '@dhis2/ui'
import { useEffect } from 'react'
import { RequireAuth } from 'react-auth-kit'
import { Outlet, useLocation, useNavigate } from 'react-router'
import styles from './Layout.module.css'
import { NavLink } from 'react-router-dom'
import StackSubNav from './StacksSubNav'

export const Layout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (location.pathname === '/') {
            navigate('/instances')
        }
    }, [location, navigate])

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
                </div>
                <div className={styles.mainArea}>
                    <Outlet />
                </div>
            </div>
        </RequireAuth>
    )
}
