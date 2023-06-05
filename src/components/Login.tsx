import { InputField, Button, Card, Help, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import jwtDecode from 'jwt-decode'
import { useSignIn } from 'react-auth-kit'
import { useNavigate } from 'react-router-dom'
import { getToken as getTokenAsync } from '../api'
import styles from './LoginPage.module.css'

type AccessToken = {
    exp: number
    iat: number
    user?: any
}

const computeSignInOptions = (data) => {
    const decodedAccessToken: AccessToken = jwtDecode(data.access_token)
    const decodedRefreshToken: AccessToken = jwtDecode(data.refresh_token)
    const expiresIn = data.expires_in / 60
    const refreshTokenExpireIn = Math.floor(
        (decodedRefreshToken.exp - decodedRefreshToken.iat) / 60
    )
    const tokenType =
        data.token_type.charAt(0).toUpperCase() + data.token_type.slice(1)

    return {
        token: data.access_token,
        expiresIn,
        tokenType,
        authState: decodedAccessToken.user,
        refreshToken: data.refresh_token,
        refreshTokenExpireIn,
    }
}

const LoginPage = () => {
    const signIn = useSignIn()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    const getToken = useCallback(() => {
        const fetchToken = async () => {
            try {
                const response = await getTokenAsync(username, password)

                if (response.status !== 201) {
                    throw new Error('Authentication token request failed')
                }

                if (signIn(computeSignInOptions(response.data))) {
                    navigate('/instances')
                } else {
                    throw new Error('Sign in failed')
                }
            } catch (error) {
                setLoginError(
                    error.response?.data ??
                        error.message ??
                        'Unknown login error'
                )
            }
        }

        fetchToken()
    }, [username, password, signIn, navigate])

    return (
        <form
            className={styles.container}
            action="login"
            autoComplete="on"
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
            </Card>
        </form>
    )
}

export default LoginPage
