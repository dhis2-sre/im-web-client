import { LogoIconWhite } from '@dhis2/ui'
import { RequireAuth } from 'react-auth-kit'
import { Outlet } from 'react-router'
import styles from './Layout.module.css'

export const Layout = () => {
    return (
        <RequireAuth loginPath={'/login'}>
            <div className={styles.container}>
                <div className={styles.nav}>
                    <h1 className={styles.header}>
                        <LogoIconWhite className={styles.logo} />
                        Instance Manager
                    </h1>
                </div>
                <div>
                    <Outlet />
                </div>
            </div>
        </RequireAuth>
    )
}
