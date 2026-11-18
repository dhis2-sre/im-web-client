import { Button, Card, CheckboxField, Help, InputField } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/index.ts'
import { baseURL } from '../hooks/use-auth-axios.ts'
import { AuthHeading } from './auth-heading.tsx'
import styles from './login.module.css'

export const Login = () => {
    const { login, isAuthenticating, authenticationErrorMessage } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState<boolean>(false)
    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            await login(email, password, rememberMe)
        },
        [login, email, password, rememberMe]
    )
    const onGoogleLogin = useCallback(() => {
        window.location.href = `${baseURL}/auth/google?rememberMe=${rememberMe}`
    }, [rememberMe])

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <AuthHeading>Log in to deploy and manage DHIS2 instances.</AuthHeading>
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
                <CheckboxField
                    name="rememberMe"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={({ checked }) => {
                        setRememberMe(checked)
                    }}
                />
                {authenticationErrorMessage && <Help error>{authenticationErrorMessage}</Help>}
                <Button primary type="submit" value="login" loading={isAuthenticating}>
                    Log in
                </Button>
                <div className={styles.divider}>or</div>
                <Button type="button" onClick={onGoogleLogin} disabled={isAuthenticating}>
                    Log in with Google
                </Button>
                <div className={styles.linkContainer}>
                    <Link to={'/sign-up'}>Sign up</Link>
                    <Link to={'/request-password-reset'}>Forgot password?</Link>
                </div>
            </Card>
        </form>
    )
}
