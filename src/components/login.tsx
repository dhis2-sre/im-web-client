import { Button, CheckboxField, Help, InputField } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/index.ts'
import { baseURL } from '../hooks/use-auth-axios.ts'
import { AuthCard } from './auth-card.tsx'
import styles from './login.module.css'
import { Mark } from './mark.tsx'

/* Google's own "G", which its sign-in guidelines ask for on the button. */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
)

export const Login = () => {
    const { login, isAuthenticating, authenticationErrorMessage } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState<boolean>(false)
    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()
            if (!isAuthenticating) {
                await login(email, password, rememberMe)
            }
        },
        [login, email, password, rememberMe, isAuthenticating]
    )
    const onGoogleLogin = useCallback(() => {
        window.location.href = `${baseURL}/auth/google?rememberMe=${rememberMe}`
    }, [rememberMe])

    return (
        <AuthCard
            heading="Log in to deploy and manage DHIS2 instances."
            onSubmit={onSubmit}
            footer={
                <>
                    New to Instance Manager? <Link to={'/sign-up'}>Create an account</Link>
                </>
            }
        >
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
            <div className={styles.row}>
                <CheckboxField
                    name="rememberMe"
                    label="Keep me logged in"
                    checked={rememberMe}
                    onChange={({ checked }) => {
                        setRememberMe(checked)
                    }}
                />
                <Link to={'/request-password-reset'}>Forgot password?</Link>
            </div>
            {authenticationErrorMessage && <Help error>{authenticationErrorMessage}</Help>}
            {/* While logging in, the mark is the spinner. */}
            <Button primary type="submit" value="login">
                {isAuthenticating ? (
                    <span className={styles.busy}>
                        <Mark size={16} onDark busy />
                        Logging in…
                    </span>
                ) : (
                    'Log in'
                )}
            </Button>
            <div className={styles.divider}>or</div>
            <Button type="button" icon={<GoogleIcon />} onClick={onGoogleLogin} disabled={isAuthenticating}>
                Continue with Google
            </Button>
        </AuthCard>
    )
}
