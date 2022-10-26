import axios from 'axios'
import { useAuthHeader } from 'react-auth-kit'
import { API_HOST } from '../api'
import styles from './LogoutButton.module.css'

const logout = (authHeader) =>
    axios
        .delete('/signOut', {
            baseURL: API_HOST,
            headers: {
                Authorization: authHeader,
            },
        })
        .catch((error) => {
            console.error(error)
        })

export const LogoutButton = () => {
    const getAuthHeader = useAuthHeader()

    return (
        <button
            onClick={() => logout(getAuthHeader())}
            className={styles.logout}
        >
            logout
        </button>
    )
}
