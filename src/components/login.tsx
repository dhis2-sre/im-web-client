import { Button, Card, CheckboxField, Help, InputField, LogoIcon } from '@dhis2/ui'
import cx from 'classnames'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/index.ts'
import { baseURL } from '../hooks/use-auth-axios.ts'
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
        window.location.href = `${baseURL}/auth/google`
    }, [])

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
                <CheckboxField
                    className={cx(styles.field, styles.checkboxfield)}
                    name="rememberMe"
                    label="Remember me?"
                    checked={rememberMe}
                    onChange={({ checked }) => {
                        setRememberMe(checked)
                    }}
                />
                {authenticationErrorMessage && <Help error>{authenticationErrorMessage}</Help>}
                <Button primary type="submit" value="login" loading={isAuthenticating}>
                    Login
                </Button>
                <div className={styles.divider}>or</div>
                <Button type="button" onClick={onGoogleLogin} disabled={isAuthenticating}>
                    Sign in with Google
                </Button>
                <div className={styles.linkContainer}>
                    <Link to={'/sign-up'}>Sign up</Link>
                    <Link to={'/request-password-reset'}>Forgot password?</Link>
                </div>
            </Card>
        </form>
    )
}
