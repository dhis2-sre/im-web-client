import { useAlert } from '@dhis2/app-service-alerts'
import { clearAuthTokens } from 'axios-jwt'
import { useCallback, useState } from 'react'
import { Navigate } from 'react-router'
import { useAuthAxios } from '../hooks'
import styles from './logout-button.module.css'

export const LogoutButton = () => {
    const { show: showError } = useAlert('Could not log out', { critical: true })
    const [isLoggedOut, setIsLoggedOut] = useState(false)
    const [, requestLogout] = useAuthAxios(
        {
            method: 'DELETE',
            url: 'users',
        },
        { manual: true, autoCatch: false }
    )

    const onClick = useCallback(async () => {
        try {
            await requestLogout()
            clearAuthTokens()
            setIsLoggedOut(true)
        } catch (error) {
            showError()
        }
    }, [requestLogout, showError])

    return isLoggedOut ? (
        <Navigate to="/login" />
    ) : (
        <button onClick={onClick} className={styles.logout}>
            Logout
        </button>
    )
}
