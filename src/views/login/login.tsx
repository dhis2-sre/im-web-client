import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { isLoggedIn, setAuthTokens } from 'axios-jwt'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import styles from './LoginPage.module.css'
import { useAuthAxios } from '../../hooks'

const getRedirectPath = (location) => {
    const referrerPath = location.state?.referrerPath

    if (!referrerPath || referrerPath === '/login') {
        return '/instances'
    }

    return referrerPath
}

export const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(() => isLoggedIn())
    const location = useLocation()
    const [{ data: tokens, loading, error }, getTokens] = useAuthAxios(
        {
            url: 'tokens',
            method: 'POST',
        },
        { manual: true }
    )

    useEffect(() => {
        if (tokens) {
            setAuthTokens({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
            })
            setIsAuthenticated(isLoggedIn())
        }
    }, [tokens])

    if (isAuthenticated) {
        return <Navigate to={getRedirectPath(location)} />
    }

    return (
        <form
            className={styles.container}
            onSubmit={(event) => {
                event.stopPropagation()
                event.preventDefault()
                getTokens({ auth: { username, password } })
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
                    disabled={loading}
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
                    disabled={loading}
                />
                {error && (
                    <Help error>
                        {error?.response?.data ?? error?.message ?? 'Could not fetch authentication tokens'}
                    </Help>
                )}
                <Button
                    primary
                    onClick={(_, event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        getTokens({ auth: { username, password } })
                    }}
                    type="submit"
                    value="login"
                    loading={loading}
                >
                    Login
                </Button>
                <Link to={`/sign-up`}>Sign up?</Link>
            </Card>
        </form>
    )
}