import {Button, Card, Help, InputField, LogoIcon} from '@dhis2/ui'
import {useCallback, useState} from 'react'
import {postSignUp} from '../api'
import styles from './SignUpPage.module.css'
import {Navigate} from "react-router";

const SignUpPage = () => {
    const passwordsUnequalMsg = 'Passwords do not match'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isCreated, setIsCreated] = useState(false)
    const [signUpError, setSignUpError] = useState('')

    const doSignUp = useCallback(async () => {
        if (password !== confirmPassword) {
            setSignUpError(passwordsUnequalMsg)
            return
        }

        try {
            const result = await postSignUp(username, password)
            if (result.status === 201) {
                setIsCreated(true)
            }
        } catch (error) {
            setSignUpError(error.response.data)
        }
    }, [username, password, confirmPassword])

    if (isCreated) {
        return <Navigate to="/login" />
    }

    return (
        <form
            className={styles.container}
            onSubmit={(event) => {
                event.stopPropagation()
                event.preventDefault()
                doSignUp()
            }}
        >
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo}/>
                    Instance manager sign up
                </h2>
                <InputField
                    name="username"
                    label="username"
                    type="email"
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
                    autoComplete="new-password"
                    onChange={({value}) => {
                        setPassword(value)
                    }}
                />
                <InputField
                    type="password"
                    name="confirm-password"
                    label="confirm-password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={({value}) => {
                        setConfirmPassword(value)
                    }}
                />
                {signUpError && <Help error>{signUpError}</Help>}
                <Button
                    primary
                    onClick={(_, event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        doSignUp()
                    }}
                    type="submit"
                    value="Sign up"
                >
                    Sign up
                </Button>
            </Card>
        </form>
    )
}

export default SignUpPage
