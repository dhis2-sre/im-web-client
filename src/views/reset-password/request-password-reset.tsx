import { useAlert } from '@dhis2/app-service-alerts'
import { Button, Help, InputField } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'

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
                setErrorMessage('Enter an email address')
                return
            }

            try {
                await postRequestPasswordReset({ data: { email } })
                showAlert({ message: `Password reset link sent to ${email}`, isCritical: false })
                navigate('/')
            } catch (error) {
                console.error(error)
                setErrorMessage(error.message)
            }
        },
        [email, postRequestPasswordReset, navigate, showAlert]
    )

    return (
        <AuthCard heading="Request password reset" onSubmit={onSubmit} footer={<Link to="/">Back to log in</Link>}>
            <InputField disabled={loading} name="email" label="Email" type="email" value={email} onChange={onInputChange} />
            {errorMessage && <Help error>{errorMessage}</Help>}
            <Button primary type="submit" value="Send reset link" disabled={!email}>
                Request password reset
            </Button>
        </AuthCard>
    )
}
