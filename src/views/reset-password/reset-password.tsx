import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import styles from './reset-password.module.css'
import {useAlert} from "@dhis2/app-service-alerts";

const getInputsErrorMessage = ({ password, confirmPassword }) => {
    if (!password) {
        return 'Please provide a password'
    } else if (!confirmPassword) {
        return 'Please confirm your password'
    } else if (password !== confirmPassword) {
        return 'Passwords do not match'
    } else {
        return ''
    }
}

export const ResetPassword = () => {
    const navigate = useNavigate()
    const { token } = useParams()
    const [inputs, setInputs] = useState({
        password: '',
        confirmPassword: '',
    })
    const [errorMessage, setErrorMessage] = useState('')
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const onInputChange = useCallback(({ value, name }) => {
        // Always clear the error when user starts typing again
        setErrorMessage('')
        setInputs((currentInputs) => ({
            ...currentInputs,
            [name]: value,
        }))
    }, [])
    const [{ loading }, postResetPassword] = useAuthAxios(
        {
            url: '/users/reset-password',
            method: 'POST',
            // data: { token, password },
        },
        { manual: true }
    )

    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()

            if (inputs.password) {
                try {
                    const password = inputs.password
                    await postResetPassword({ data: { token, password } })
                    showAlert({ message: `Password has been reset.`, isCritical: false })
                    navigate('/login')
                } catch (error) {
                    console.error(error)
                    setErrorMessage(error.message)
                }
            } else {
                setErrorMessage(getInputsErrorMessage(inputs))
            }
        },
        [inputs, postResetPassword, navigate]
    )

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Reset password
                </h2>
                <InputField disabled={loading} name="password" label="New password" type="password" value={inputs.password} autoComplete="new-password" onChange={onInputChange} />
                <InputField disabled={loading} name="confirmPassword" label="Confirm new password" type="password" value={inputs.confirmPassword} autoComplete="new-password" onChange={onInputChange} />
                {errorMessage && <Help error>{errorMessage}</Help>}
                <Button primary type="submit" value="Reset password" disabled={!inputs.password}>
                    Reset password
                </Button>
            </Card>
        </form>
    )
}
