import axios from 'axios'
import { useAuthHeader } from 'react-auth-kit'
import { useNavigate } from 'react-router'
import { API_HOST } from '../api'
import styles from './LogoutButton.module.css'
import { clearAuthItemsFromLocalStorage } from '../modules'

const logout = (authHeader) =>
    axios
        .delete('/users', {
            baseURL: API_HOST,
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
    const getAuthHeader = useAuthHeader()
    const navigate = useNavigate()
    return (
        <button
            onClick={() =>
                logout(getAuthHeader()).then(() => navigate('/login'))
            }
            className={styles.logout}
        >
            Logout
        </button>
    )
}
