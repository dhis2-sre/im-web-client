import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './login.module.css'
import { useAuth } from '../../hooks'

export const Login = () => {
    const { login, isAuthenticating, tokensRequestError } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            await login(email, password)
        },
        [login, email, password]
    )

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Instance Manager login
                </h2>
                <InputField
                    name="email"
                    label="Email"
                    value={email}
                    autoComplete="email"
                    onChange={({ value }) => {
                        setEmail(value)
                    }}
                    disabled={isAuthenticating}
                />
                <InputField
                    type="password"
                    name="password"
                    label="Password"
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
                <div className={styles.linkContainer}>
                    <Link to={'/sign-up'}>Sign up</Link>
                    <Link to={'/request-password-reset'}>Forgot password?</Link>
                </div>
            </Card>
        </form>
    )
}
