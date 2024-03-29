import {Button, Card, CheckboxField, Help, InputField, LogoIcon} from '@dhis2/ui'
import cx from 'classnames'
import {useCallback, useState} from 'react'
import {Link} from 'react-router-dom'
import styles from './login.module.css'
import {useAuth} from '../../hooks'

export const Login = () => {
    const { login, isAuthenticating, tokensRequestError } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState<boolean>(false)
    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()
            await login(email, password, rememberMe)
        },
        [login, email, password, rememberMe]
    )

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Instance manager login
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
                    type="checkbox"
                    name="rememberMe"
                    label="Remember me?"
                    checked={rememberMe}
                    onChange={({checked}) => {
                        setRememberMe(checked)
                    }}
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
