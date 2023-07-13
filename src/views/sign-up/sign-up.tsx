import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    const navigate = useNavigate()
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
    const [{ loading }, postSignup] = useAuthAxios(
        {
            url: 'users',
            method: 'POST',
        },
        { manual: true, autoCatch: false }
    )

    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()

            if (inputs.email && inputs.password && inputs.password === inputs.confirmPassword) {
                try {
                    const { email, password } = inputs
                    postSignup({ data: { email, password } })
                    navigate('/login')
                } catch (error) {
                    console.error(error)
                    setErrorMessage(error.message)
                }
            } else {
                setErrorMessage(getInputsErrorMessage(inputs))
            }
        },
        [inputs, postSignup, navigate]
    )

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Instance manager sign up
                </h2>
                <InputField disabled={loading} name="email" label="email" type="email" value={inputs.email} onChange={onInputChange} />
                <InputField disabled={loading} type="password" name="password" label="password" value={inputs.password} autoComplete="new-password" onChange={onInputChange} />
                <InputField
                    disabled={loading}
                    type="password"
                    name="confirmPassword"
                    label="confirmPassword"
                    value={inputs.confirmPassword}
                    autoComplete="new-password"
                    onChange={onInputChange}
                />
                {errorMessage && <Help error>{errorMessage}</Help>}
                <Button primary type="submit" value="Sign up" disabled={!inputs.email || !inputs.password || !inputs.confirmPassword}>
                    Sign up
                </Button>
            </Card>
        </form>
    )
}
