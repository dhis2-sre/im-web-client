import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useIsAuthenticated, useSignIn } from 'react-auth-kit'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { getToken as getTokenAsync } from '../api'
import styles from './LoginPage.module.css'
import { parseToken } from '../modules'

const computeSignInOptions = (data) => {
    const parsedAccessToken = parseToken(data.accessToken)
    const parsedRefreshToken = parseToken(data.refreshToken)
    const tokenType = data.tokenType.charAt(0).toUpperCase() + data.tokenType.slice(1)

    return {
        token: data.accessToken,
        expiresIn: parsedAccessToken.expiryDurationInMinutes,
        tokenType,
        authState: parsedAccessToken.user,
        refreshToken: data.refreshToken,
        refreshTokenExpireIn: parsedRefreshToken.expiryDurationInMinutes,
    }
}

const getRedirectPath = (location) => {
    const redirectPath = location.state?.redirectPath

    if (!redirectPath || redirectPath === '/login') {
        return '/instances'
    }

    return redirectPath
}

const LoginPage = () => {
    const signIn = useSignIn()
    const isAuthenticated = useIsAuthenticated()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const location = useLocation()

    const getToken = useCallback(async () => {
        try {
            const response = await getTokenAsync(username, password)

            if (response.status !== 201) {
                throw new Error('Authentication token request failed')
            }

            const signinResult = signIn(computeSignInOptions(response.data))

            if (!signinResult) {
                throw new Error('Sign in failed')
            }
        } catch (error) {
            setLoginError(error.response?.data ?? error.message ?? 'Unknown login error')
        }
    }, [username, password, signIn])

    if (isAuthenticated()) {
        return <Navigate to={getRedirectPath(location)} />
    }

    return (
        <form
            className={styles.container}
            onSubmit={(event) => {
                event.stopPropagation()
                event.preventDefault()
                getToken()
            }}
        >
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Instance manager login
                </h2>
                <InputField
                    name="username"
                    label="username"
                    value={username}
                    autoComplete="username email"
                    onChange={({ value }) => {
                        setUsername(value)
                    }}
                />
                <InputField
                    type="password"
                    name="password"
                    label="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={({ value }) => {
                        setPassword(value)
                    }}
                />
                {loginError && <Help error>{loginError}</Help>}
                <Button
                    primary
                    onClick={(_, event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        getToken()
                    }}
                    type="submit"
                    value="login"
                >
                    Login
                </Button>
                <Link to={`/sign-up`}>Sign up?</Link>
            </Card>
        </form>
    )
}

export default LoginPage
