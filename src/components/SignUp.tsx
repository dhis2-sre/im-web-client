import {Button, Card, Help, InputField, LogoIcon} from '@dhis2/ui'
import {useCallback, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {postSignUp} from '../api'
import styles from './SignUpPage.module.css'

const SignUpPage = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [signUpError, setSignUpError] = useState('')

    const doSignUp = useCallback(() => {
        const signUp = async () => {
            try {
                const result = await postSignUp(username, password)
                if (result.status === 201) {
                    window.requestAnimationFrame(() => navigate('/login'))
                }
            } catch (error) {
                setSignUpError(error.response.data)
            }
        }

        signUp()
    }, [username, password, navigate])

    return (
        <div className={styles.container}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo}/>
                    Instance manager sign up
                </h2>
                <InputField
                    name="username"
                    label="username"
                    value={username}
                    onChange={({value}) => {
                        setUsername(value)
                    }}
                />
                <InputField
                    type="password"
                    name="password"
                    label="password"
                    value={password}
                    onChange={({value}) => {
                        setPassword(value)
                    }}
                />
                {signUpError && <Help error>{signUpError}</Help>}
                <Button primary onClick={doSignUp}>Sign up</Button>
            </Card>
        </div>
    )
}

export default SignUpPage
