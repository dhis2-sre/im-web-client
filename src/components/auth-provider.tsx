import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthAxios } from '../hooks'
import { AuthContext } from '../contexts'
import { UNAUTHORIZED_EVENT } from '../hooks/use-auth-axios'
import { Outlet, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Login } from './login'

const CURRENT_USER_LOCAL_STORAGE_KEY = 'DHIS2_IM_CURRENT_USER'
const getCurrentUserFromLocalStorage = () => JSON.parse(localStorage.getItem(CURRENT_USER_LOCAL_STORAGE_KEY))
const setCurrentUserToLocalStorage = (user: User) => localStorage.setItem(CURRENT_USER_LOCAL_STORAGE_KEY, JSON.stringify(user))
const removeCurrentUserFromLocalStorage = () => localStorage.removeItem(CURRENT_USER_LOCAL_STORAGE_KEY)

export const AuthProvider: FC = () => {
    const navigate = useNavigate()
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [authenticationErrorMessage, setAuthenticationErrorMessage] = useState('')
    const [currentUser, _setCurrentUser] = useState<User | null>(() => getCurrentUserFromLocalStorage())
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
    const [, initiateGoogleLogin] = useAuthAxios({ method: 'GET', url: '/auth/google' }, { manual: true })
    const [, requestLogout] = useAuthAxios({ method: 'DELETE', url: '/users' }, { manual: true })

    const [checkingUser, setCheckingUser] = useState(true)
    useEffect(
        () => {
            const checkLoggedIn = async () => {
                try {
                    const userResponse = await getUser()
                    if (currentUser?.id !== userResponse.data.id) {
                        setCurrentUser(userResponse.data)
                    }
                } catch (e) {
                    if (currentUser?.id) {
                        setCurrentUser(null)
                        navigate('/')
                    }
                }
            }

            if (currentUser?.id) {
                checkLoggedIn().finally(() => setCheckingUser(false))
            } else {
                setCheckingUser(false)
            }
        },

        // We only want to check when the user opens the app
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    const login = useCallback(
        async (username: string, password: string) => {
            setIsAuthenticating(true)
            try {
                await getTokens({ auth: { username, password } })
                const userResponse = await getUser()

                setAuthenticationErrorMessage('')
                setCurrentUser(userResponse.data)
            } catch (error) {
                console.error(error)
                const errorMessage = error instanceof AxiosError || error instanceof Error ? error.message : 'Unknown error'
                setAuthenticationErrorMessage(errorMessage)
                setCurrentUser(null)
            } finally {
                setIsAuthenticating(false)
            }
        },
        [getTokens, getUser, setCurrentUser]
    )

    const googleLogin = useCallback(async () => {
        try {
            const response = await initiateGoogleLogin()
            window.location.href = response.data.redirectUrl
        } catch (error) {
            console.error('Google login failed:', error)
        }
    }, [initiateGoogleLogin])

    const logout = useCallback(async () => {
        const response = await requestLogout()
        if (response.status === 200) {
            setCurrentUser(null)
            navigate('/')
        }
    }, [requestLogout, navigate, setCurrentUser])

    useEffect(() => {
        const handleUnauthorization = (event) => {
            setCurrentUser(null)
            navigate('/')
        }

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)

        return () => {
            window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)
        }
    }, [setCurrentUser, navigate])

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAdministrator,
                isAuthenticating,
                authenticationErrorMessage,
                login,
                googleLogin,
                logout
            }}
        >
            {
                // We're not validating a user on app load and there's a user
                !checkingUser && currentUser && <Outlet />
            }

            {
                // We're not validating a user on app load and there's a user
                // and there's no user in the first place
                // -> Prevents loading screen
                !checkingUser && !currentUser && <Login />
            }

            {
                // We won't display anything while we're still checking the user initially
                // to prevent flickering
                ''
            }
        </AuthContext.Provider>
    )
}
