import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FC } from 'react'
import { getAccessToken, isLoggedIn, setAuthTokens, clearAuthTokens } from 'axios-jwt'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import type { User, Tokens } from '../types'
import { useAuthAxios } from '../hooks'
import { AuthContext } from '../contexts'
import { UNAUTHORIZED_EVENT } from '../hooks/use-auth-axios'
import { Outlet, useNavigate } from 'react-router-dom'

interface JwtPayloadWithUser extends JwtPayload {
    user: User
}

export const AuthProvider: FC = () => {
    const navigate = useNavigate()
    const [{ loading: isAuthenticating, error: tokensRequestError }, getTokens] = useAuthAxios<Tokens>(
        {
            url: '/tokens',
            method: 'POST',
        },
        { manual: true, autoCatch: true }
    )
    const [, requestLogout] = useAuthAxios(
        {
            method: 'DELETE',
            url: '/users',
        },
        { manual: true }
    )
    const [accessToken, setAccessToken] = useState(getAccessToken())
    const isAuthenticated = useMemo(isLoggedIn, [accessToken])
    const currentUser = useMemo<User>(() => (accessToken ? jwtDecode<JwtPayloadWithUser>(accessToken).user : null), [accessToken])
    const isAdministrator = useMemo(() => currentUser?.groups.some((group) => group.name === 'administrators'), [currentUser])
    const [redirectPath, setRedirectPath] = useState('')

    const login = useCallback(
        async (username, password) => {
            const result = await getTokens({ auth: { username, password } })
            if (result?.data) {
                const { accessToken, refreshToken } = result.data
                setAuthTokens({ accessToken, refreshToken })
                setAccessToken(accessToken)
            }
        },
        [getTokens]
    )

    const logout = useCallback(async () => {
        if (isLoggedIn()) {
            await requestLogout()
            clearAuthTokens()
            setAccessToken(null)
        } else {
            return Promise.reject('Logout error: Already logged out')
        }
    }, [requestLogout])

    const handleUnauthorization = useCallback(
        (event) => {
            setRedirectPath(event.detail)
            clearAuthTokens()
            setAccessToken(null)
            navigate('/login')
        },
        [navigate]
    )

    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)

        return () => {
            window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)
        }
    }, [handleUnauthorization])

    useEffect(() => {
        const { pathname } = window.location

        if (pathname !== redirectPath) {
            if (!isAuthenticated && pathname !== '/login') {
                setRedirectPath(pathname)
                navigate('/login')
            }
            if (isAuthenticated) {
                if (pathname === '/login') {
                    navigate(redirectPath ?? '/instances')
                }
                setRedirectPath('')
            }
        }
    }, [isAuthenticated, navigate, redirectPath])

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAdministrator,
                isAuthenticating,
                isAuthenticated,
                tokensRequestError,
                login,
                logout,
            }}
        >
            <Outlet />
        </AuthContext.Provider>
    )
}
