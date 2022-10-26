import { LogoIconWhite } from '@dhis2/ui'
import { useEffect } from 'react'
import { RequireAuth } from 'react-auth-kit'
import { Outlet, useLocation, useNavigate } from 'react-router'
import styles from './Layout.module.css'
import {Link} from "react-router-dom";

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
                    <Link to="/stacks">Stacks</Link>
                    <br />
                    <Link to="/instances">Instances</Link>
                </div>
                <div>
                    <Outlet />
                </div>
            </div>
        </RequireAuth>
    )
}
