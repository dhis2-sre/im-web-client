import { clearAuthTokens, isLoggedIn } from 'axios-jwt'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { useAuthAxios } from '../hooks'
import styles from './logout-button.module.css'

export const LogoutButton = () => {
    const [isLoggedOut, setIsLoggedOut] = useState(false)
    const [{ response }, requestLogout] = useAuthAxios(
        {
            method: 'DELETE',
            url: 'users',
        },
        { manual: true }
    )

    useEffect(() => {
        if (response?.status === 200 && isLoggedIn()) {
            clearAuthTokens()
            setIsLoggedOut(true)
        }
    }, [response])

    return isLoggedOut ? (
        <Navigate to="/login" />
    ) : (
        <button onClick={() => requestLogout()} className={styles.logout}>
            Logout
        </button>
    )
}
