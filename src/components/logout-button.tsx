import { useAlert } from '@dhis2/app-service-alerts'
import { FC, useCallback } from 'react'
import styles from './logout-button.module.css'
import { useAuth } from '../hooks'

export const LogoutButton: FC = () => {
    const { logout } = useAuth()
    const { show: showError } = useAlert(({ message }) => `Could not log out: ${message}`, { critical: true })

    const onClick = useCallback(async () => {
        try {
            await logout()
        } catch (error) {
            console.error(error)
            const message = error?.response?.data ?? error?.message ?? 'Logout error: could not log out'
            showError({ message })
        }
    }, [logout, showError])

    return (
        <button onClick={onClick} className={styles.logout}>
            Logout
        </button>
    )
}
