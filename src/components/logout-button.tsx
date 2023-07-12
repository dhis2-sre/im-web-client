import { useAlert } from '@dhis2/app-service-alerts'
import { clearAuthTokens, isLoggedIn } from 'axios-jwt'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAuthAxios } from '../hooks'
import styles from './logout-button.module.css'

export const LogoutButton = () => {
    const navigate = useNavigate()
    const { show: showError } = useAlert('Could not log out', { critical: true })
    const [, requestLogout] = useAuthAxios(
        {
            method: 'DELETE',
            url: 'users',
        },
        { manual: true, autoCatch: false }
    )

    const onClick = useCallback(async () => {
        if (isLoggedIn()) {
            try {
                await requestLogout()
                clearAuthTokens()
                navigate('/login')
            } catch (error) {
                console.error(error)
                showError()
            }
        } else {
            navigate('/login')
        }
    }, [requestLogout, showError, navigate])

    return (
        <button onClick={onClick} className={styles.logout}>
            Logout
        </button>
    )
}
