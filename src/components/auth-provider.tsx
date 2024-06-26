import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Login } from '../views/login/index'
import type { Tokens, User } from '../types'
import { useAuthAxios } from '../hooks'
import { AuthContext } from '../contexts'
import { UNAUTHORIZED_EVENT } from '../hooks/use-auth-axios'
import { Outlet, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'

const CURRENT_USER_LOCAL_STORAGE_KEY = 'DHIS2_IM_CURRENT_USER'
const getCurrentUserFromLocalStorage = () => JSON.parse(localStorage.getItem(CURRENT_USER_LOCAL_STORAGE_KEY))
const setCurrentUserToLocalStorage = (user: User) => localStorage.setItem(CURRENT_USER_LOCAL_STORAGE_KEY, JSON.stringify(user))
const removeCurrentUserFromLocalStorage = () => localStorage.removeItem(CURRENT_USER_LOCAL_STORAGE_KEY)

export const AuthProvider: FC = () => {
    const navigate = useNavigate()
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [authenticationErrorMessage, setAuthenticationErrorMessage] = useState('')
    const [redirectPath, setRedirectPath] = useState('')
    const [currentUser, _setCurrentUser] = useState<User | null>(getCurrentUserFromLocalStorage)
    const setCurrentUser = useCallback((nextUser) => {
        _setCurrentUser(nextUser)

        if (nextUser) {
            setCurrentUserToLocalStorage(nextUser)
        } else {
            removeCurrentUserFromLocalStorage()
        }
    }, [])
    const isAdministrator = useMemo(() => currentUser?.groups.some((group) => group.name === 'administrators'), [currentUser])

    const [, getTokens] = useAuthAxios<Tokens>({ method: 'POST', url: '/tokens', headers: { 'Content-Type': 'application/json' }, data: {} }, { manual: true, autoCatch: false })
    const [, getUser] = useAuthAxios<User>({ method: 'GET', url: '/me' }, { manual: true, autoCatch: false })
    const [, requestLogout] = useAuthAxios({ method: 'DELETE', url: '/users' }, { manual: true })

    // Redirect if already logged in when on /login
    useEffect(() => {
        async function checkLoggedIn() {
            try {
                const userResponse = await getUser()

                if (currentUser.id !== userResponse.data.id) {
                  setCurrentUser(userResponse.data)
                }

                setTimeout(() => navigate(redirectPath || '/'), 0)
            } catch (e) {
              if (currentUser) {
                setCurrentUser(null)
              }
            }
        }

        checkLoggedIn()
    }, [currentUser, navigate])

    const login = useCallback(
        async (username: string, password: string) => {
            setIsAuthenticating(true)
            try {
                await getTokens({ auth: { username, password } })
                const userResponse = await getUser()

                setAuthenticationErrorMessage('')
                setCurrentUser(userResponse.data)
                navigate(redirectPath || '/')
            } catch (error) {
                console.error(error)
                const errorMessage = error instanceof AxiosError || error instanceof Error ? error.message : 'Unknown error'
                setAuthenticationErrorMessage(errorMessage)
                setCurrentUser(null)
            } finally {
                setIsAuthenticating(false)
            }
        },
        [getTokens, getUser, navigate, redirectPath]
    )

    const logout = useCallback(async () => {
        const response = await requestLogout()
        if (response.status === 200) {
            setCurrentUser(null)
            navigate('/')
        }
    }, [requestLogout, navigate])

    const handleUnauthorization = useCallback(
        (event) => {
            setRedirectPath(event.detail)
            setCurrentUser(null)
            navigate('/')
        },
        [navigate]
    )

    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)

        return () => {
            window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)
        }
    }, [handleUnauthorization])

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAdministrator,
                isAuthenticating,
                authenticationErrorMessage,
                login,
                logout,
            }}
        >
          {currentUser && <Outlet />}
          {!currentUser && <Login />}
        </AuthContext.Provider>
    )
}
