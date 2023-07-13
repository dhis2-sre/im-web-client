import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { isLoggedIn, setAuthTokens } from 'axios-jwt'
import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import styles from './login.module.css'
import { useAuthAxios } from '../../hooks'
import { Tokens } from '../../types'

const getReferrerPath = (location) => {
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
    const [{ loading, error }, getTokens] = useAuthAxios<Tokens>(
        {
            url: '/tokens',
            method: 'POST',
        },
        { manual: true }
    )
    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            try {
                const { data: tokens } = await getTokens({ auth: { username, password } })
                setAuthTokens({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                })
                setIsAuthenticated(isLoggedIn())
            } catch (error) {
                console.error(error)
            }
        },
        [getTokens, username, password]
    )

    if (isAuthenticated) {
        return <Navigate to={getReferrerPath(location)} />
    }

    return (
        <form className={styles.container} onSubmit={onSubmit}>
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
                {error && <Help error>{error?.response?.data ?? error?.message ?? 'Could not fetch authentication tokens'}</Help>}
                <Button primary type="submit" value="login" loading={loading}>
                    Login
                </Button>
                <Link to={`/sign-up`}>Sign up?</Link>
            </Card>
        </form>
    )
}
