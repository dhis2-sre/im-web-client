import { Button, Card, Help, InputField, LogoIcon } from '@dhis2/ui'
import { useAlert } from '@dhis2/app-service-alerts';
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import styles from './reset-password.module.css'

export const RequestPasswordReset = () => {
    const navigate = useNavigate()
    const [inputs, setInputs] = useState({
        email: '',
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
    const [{ loading }, postRequestReset] = useAuthAxios(
        {
            url: '/users/request-reset',
            method: 'POST',
        },
        { manual: true }
    )

    const onSubmit = useCallback(
        async (event) => {
            event.preventDefault()

            if (inputs.email) {
                try {
                    const { email } = inputs
                    await postRequestReset({ data: { email } })
                    showAlert({ message: `Password reset link sent to "${email}".`, isCritical: false })
                    navigate('/login')
                } catch (error) {
                    console.error(error)
                    setErrorMessage(error.message)
                }
            } else {
                setErrorMessage('Please provide an email address')
            }
        },
        [inputs, postRequestReset, navigate]
    )

    return (
        <form className={styles.container} onSubmit={onSubmit}>
            <Card className={styles.box}>
                <h2 className={styles.header}>
                    <LogoIcon className={styles.logo} />
                    Request password reset
                </h2>
                <InputField disabled={loading} name="email" label="Email" type="email" value={inputs.email} onChange={onInputChange} />
                {errorMessage && <Help error>{errorMessage}</Help>}
                <Button primary type="submit" value="Request password reset" disabled={!inputs.email}>
                    Request password reset
                </Button>
            </Card>
        </form>
    )
}
