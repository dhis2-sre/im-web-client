import axios from 'axios'
import { useAuthHeader, useSignOut } from 'react-auth-kit'
import { API_URL } from '../api'
import styles from './LogoutButton.module.css'
import { clearAuthItemsFromLocalStorage } from '../modules'

const logout = (authHeader) =>
    axios
        .delete('/users', {
            baseURL: API_URL,
            headers: {
                Authorization: authHeader,
            },
        })
        .then(() => {
            clearAuthItemsFromLocalStorage()
        })
        .catch((error) => {
            console.error(error)
        })

export const LogoutButton = () => {
    const signOut = useSignOut()
    const getAuthHeader = useAuthHeader()
    return (
        <button
            onClick={() =>
                logout(getAuthHeader()).then(() => {
                    signOut()
                })
            }
            className={styles.logout}
        >
            Logout
        </button>
    )
}
