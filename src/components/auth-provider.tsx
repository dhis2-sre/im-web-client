import type {FC} from 'react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import jwtDecode, {JwtPayload} from 'jwt-decode'
import type {Tokens, User} from '../types'
import {useAuthAxios} from '../hooks'
import {AuthContext} from '../contexts'
import {UNAUTHORIZED_EVENT} from '../hooks/use-auth-axios'
import {Outlet, useNavigate} from 'react-router-dom'

interface JwtPayloadWithUser extends JwtPayload {
    user: User
}

export const AuthProvider: FC = () => {
    const navigate = useNavigate()

    const [{ loading: isAuthenticating, error: tokensRequestError }, getTokens] = useAuthAxios<Tokens>(
        {
            url: '/tokens',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            data: {}
        },
        { manual: true, autoCatch: true }
    )

    const [, requestLogout] = useAuthAxios(
        {method: 'DELETE', url: '/users'},
        {manual: true}
    )
    const [accessToken, setAccessToken] = useState<string>()
    const currentUser = useMemo<User>(() => (accessToken ? jwtDecode<JwtPayloadWithUser>(accessToken).user : null), [accessToken])
    const isAdministrator = useMemo(() => currentUser?.groups.some((group) => group.name === 'administrators'), [currentUser])
    const [redirectPath, setRedirectPath] = useState('')

    const isAuthenticated = useCallback(() => {
        return currentUser !== null
    }, [currentUser])

    const login = useCallback(async (username: string, password: string, rememberMe: boolean) => {
        try {
            const response = await getTokens({auth: {username, password}, data: {rememberMe}})
            if (response.status === 201) {
                const {accessToken, refreshToken} = response.data
                setAccessToken(accessToken)
            }
        } catch (e) {
            console.log(e)
        }
    }, [getTokens])

    const logout = useCallback(async () => {
        const response = await requestLogout()
        if (response.status === 200) {
            setAccessToken(null)
            navigate("/login")
        }
    }, [requestLogout])

    const handleUnauthorization = useCallback((event) => {
        setRedirectPath(event.detail)
        setAccessToken(null)
        navigate('/login')
    }, [navigate])

    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)

        return () => {
            window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorization, false)
        }
    }, [handleUnauthorization])

    useEffect(() => {
        const {pathname} = window.location

        if (pathname !== redirectPath) {
            if (!isAuthenticated() && pathname !== '/login') {
                setRedirectPath(pathname)
                navigate('/login')
            }
            if (isAuthenticated()) {
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
            <Outlet/>
        </AuthContext.Provider>
    )
}
