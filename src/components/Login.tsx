import { InputField, Button, Card, Help, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useSignIn } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'
import { getToken as getTokeAsync } from '../api'
import styles from './LoginPage.module.css'

const LoginPage = () => {
    const signIn = useSignIn()
    const navigate = useNavigate()
    const [username, setUsername] = useState('hackathon@dhis2.org')
    const [password, setPassword] = useState('dhis2-hackathon-dhis2')
    const [loginError, setLoginError] = useState('')

    const getToken = useCallback(() => {
        const fetchToken = async () => {
            try {
                const result = await getTokeAsync(username, password)
                signIn({
                    token: result.data.access_token,
                    expiresIn: result.data.expires_in,
                    // tokenType: result.data.token_type,
                    tokenType: 'Bearer',
                    authState: {
                        username,
                        password,
                    },
                    refreshToken: result.data.refresh_token,
                    refreshTokenExpireIn: 15,
                })
                window.requestAnimationFrame(() => navigate('/instances'))
            } catch (error) {
                setLoginError(error.response.data)
            }
        }

        fetchToken()
    }, [username, password, signIn, navigate])

    return (
        <div className={styles.container}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Instance manager login
                </h2>
                <InputField
                    name="username"
                    label="username"
                    value={username}
                    onChange={({ value }) => {
                        setUsername(value)
                    }}
                />
                <InputField
                    type="password"
                    name="password"
                    label="password"
                    value={password}
                    onChange={({ value }) => {
                        setPassword(value)
                    }}
                />
                {loginError && <Help error>{loginError}</Help>}
                <Button primary onClick={getToken}>
                    Login
                </Button>
            </Card>
        </div>
    )
}

export default LoginPage
