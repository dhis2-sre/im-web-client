import {useCallback, useEffect, useMemo, useState} from 'react'
import type {FC} from 'react'
import jwtDecode, {JwtPayload} from 'jwt-decode'
import type {User, Tokens} from '../types'
import {useAuthAxios} from '../hooks'
import {AuthContext} from '../contexts'
import {baseURL, UNAUTHORIZED_EVENT} from '../hooks/use-auth-axios'
import {Outlet, useNavigate} from 'react-router-dom'
import {makeUseAxios} from 'axios-hooks'
import axios from 'axios'

interface JwtPayloadWithUser extends JwtPayload {
    user: User
}

export const AuthProvider: FC = () => {
    const navigate = useNavigate()

    const axiosInstance = axios.create({baseURL, withCredentials: true})
    const useAxios = makeUseAxios({axios: axiosInstance})
    const [{loading: isAuthenticating, error: tokensRequestError}, getTokens] = useAxios<Tokens>(
        {url: '/tokens', method: 'POST'},
        {manual: true}
    )

    const [, requestLogout] = useAuthAxios(
        {
            method: 'DELETE',
            url: '/users',
        },
        {manual: true}
    )
    const [accessToken, setAccessToken] = useState<string>()
    //    const isAuthenticated = useMemo<boolean>(isLoggedIn, [accessToken])
    const currentUser = useMemo<User>(() => (accessToken ? jwtDecode<JwtPayloadWithUser>(accessToken).user : null), [accessToken])
    const isAdministrator = useMemo(() => currentUser?.groups.some((group) => group.name === 'administrators'), [currentUser])
    const [redirectPath, setRedirectPath] = useState('')

    const isAuthenticated = useCallback(() => {
        return currentUser !== null
    }, [currentUser])

    const login = useCallback(
        async (username, password) => {
            const result = await getTokens({auth: {username, password}})
            if (result?.data) {
                const {accessToken, refreshToken} = result.data
                setAccessToken(accessToken)
            }
        },
        [getTokens]
    )

    const logout = useCallback(async () => {
        const response = await requestLogout()
        if (response.status === 200) {
            //            setC
        }
        /*
                if (isLoggedIn()) {
                    await requestLogout()
                    clearAuthTokens()
                    setAccessToken(null)
                } else {
                    return Promise.reject('Logout error: Already logged out')
                }
         */
    }, [requestLogout])

    const handleUnauthorization = useCallback(
        (event) => {
            setRedirectPath(event.detail)
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
