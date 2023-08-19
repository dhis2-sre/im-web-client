import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './login.module.css'
import { useAuth } from '../../hooks'

export const Login = () => {
    const { login, isAuthenticating, tokensRequestError } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            await login(username, password)
        },
        [login, username, password]
    )

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
                    disabled={isAuthenticating}
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
                    disabled={isAuthenticating}
                />
                {tokensRequestError && <Help error>{tokensRequestError?.response?.data ?? tokensRequestError?.message ?? 'Could not fetch authentication tokens'}</Help>}
                <Button primary type="submit" value="login" loading={isAuthenticating}>
                    Login
                </Button>
                <Link to={`/sign-up`}>Sign up?</Link>
            </Card>
        </form>
    )
}
