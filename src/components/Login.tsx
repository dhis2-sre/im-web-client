import { InputField, Button } from '@dhis2/ui'
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

    const getToken = useCallback(() => {
        const fetchToken = async () => {
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
            navigate('/instances')
        }
        fetchToken()
    }, [username, password, signIn, navigate])

    return (
        <div className={styles.container}>
            <div className={styles.box}>
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
                <br />
                <Button primary onClick={getToken}>
                    Login
                </Button>
            </div>
        </div>
    )
}

export default LoginPage
