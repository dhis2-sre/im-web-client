import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import {useCallback, useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import styles from './login.module.css'
import {useAuth, useAuthAxios} from '../../hooks'

export const Login = () => {
    const [, getCors] = useAuthAxios({
        method: 'get',
        url: 'https://play.im.dhis2.org/dev/api/42/locales/ui',
    }, { manual: true, autoCatch: true })

    useEffect(() => {
        const getUrl = async () => {
            const response = await getCors()
            console.log(response)
        }
        getUrl()
    }, [])

    const {login, isAuthenticating, tokensRequestError} = useAuth()
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
                    <LogoIcon className={styles.logo}/>
                    Instance manager login
                </h2>
                <InputField
                    name="email"
                    label="Email"
                    value={email}
                    autoComplete="email"
                    onChange={({value}) => {
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
                <Link to={`/sign-up`}>Sign up?</Link>
            </Card>
        </form>
    )
}
