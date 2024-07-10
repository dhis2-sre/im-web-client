import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useAlert } from '@dhis2/app-service-alerts'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import styles from './reset-password.module.css'

export const RequestPasswordReset = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const onInputChange = useCallback(({ value }) => {
        // Always clear the error when user starts typing again
        setErrorMessage('')
        setEmail(value)
    }, [])
    const [{ loading }, postRequestPasswordReset] = useAuthAxios(
        {
            method: 'POST',
            url: '/users/request-reset',
        },
        { manual: true }
    )

    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()

            if (!email) {
                setErrorMessage('Please provide a valid email address')
                return
            }

            try {
                await postRequestPasswordReset({ data: { email } })
                showAlert({ message: `Password reset link sent to "${email}"`, isCritical: false })
                navigate('/')
            } catch (error) {
                console.error(error)
                setErrorMessage(error.message)
            }
        },
        [email, postRequestPasswordReset, navigate, showAlert]
    )

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Request password reset
                </h2>
                <InputField disabled={loading} name="email" label="Email" type="email" value={email} onChange={onInputChange} />
                {errorMessage && <Help error>{errorMessage}</Help>}
                <Button primary type="submit" value="Request password reset" disabled={!email}>
                    Request password reset
                </Button>
            </Card>
        </form>
    )
}
