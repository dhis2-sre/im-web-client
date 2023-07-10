import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import styles from './sign-up.module.css'

const getInputsErrorMessage = ({ email, password, confirmPassword }) => {
    if (!email) {
        return 'Please provide an email address'
    } else if (!password) {
        return 'Please provide a password'
    } else if (!confirmPassword) {
        return 'Please confirm your password'
    } else if (password !== confirmPassword) {
        return 'Passwords do not match'
    } else {
        return ''
    }
}

export const SignUp = () => {
    const [inputs, setInputs] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errorMessage, setErrorMessage] = useState('')
    const onInputChange = useCallback(({ value, name }) => {
        // Always clear the error when user starts typing again
        setErrorMessage('')
        setInputs((currentInputs) => ({
            ...currentInputs,
            [name]: value,
        }))
    }, [])
    const [{ response, error, loading }, postSignup] = useAuthAxios({
        url: 'users',
        method: 'POST',
    })
    const isInputValid = inputs.email && inputs.password && inputs.password === inputs.confirmPassword
    const onSubmit = useCallback(() => {
        if (isInputValid) {
            const { email, password } = inputs
            postSignup({ data: { email, password } })
        } else {
            setErrorMessage(getInputsErrorMessage(inputs))
        }
    }, [inputs, isInputValid, postSignup])

    useEffect(() => {
        if (error && !loading) {
            setErrorMessage(error.message)
        }
    }, [error, loading])

    if (response?.status === 201) {
        return <Navigate to="/login" />
    }

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Instance manager sign up
                </h2>
                <InputField
                    disabled={loading}
                    name="email"
                    label="email"
                    type="email"
                    value={inputs.email}
                    onChange={onInputChange}
                />
                <InputField
                    disabled={loading}
                    type="password"
                    name="password"
                    label="password"
                    value={inputs.password}
                    autoComplete="new-password"
                    onChange={onInputChange}
                />
                <InputField
                    disabled={loading}
                    type="password"
                    name="confirm-password"
                    label="confirm-password"
                    value={inputs.confirmPassword}
                    autoComplete="new-password"
                    onChange={onInputChange}
                />
                {errorMessage && <Help error>{errorMessage}</Help>}
                <Button primary onClick={onSubmit} type="submit" value="Sign up" disabled>
                    Sign up
                </Button>
            </Card>
        </form>
    )
}
