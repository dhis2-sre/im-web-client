import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuthAxios } from '../../hooks/index.ts'

export const Validate = () => {
    const { token } = useParams()
    const [{ loading, error }, fetch] = useAuthAxios(
        {
            url: '/users/validate',
            method: 'post',
            data: { token },
        },
        { manual: true }
    )
    const [validated, setValidated] = useState<boolean>(false)

    useEffect(() => {
        const submit = async () => {
            try {
                await fetch()
                setValidated(true)
            } catch (error) {
                console.error(error)
            }
        }
        submit()
    }, [fetch, token])

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (validated) {
        return <Navigate to="/validate/success" />
    }

    if (error) {
        return (
            <NoticeBox error title="Couldn't verify your account">
                {error.response?.status === 404 ? "This verification link isn't valid. Check that you opened the whole link from the email." : error.message}
            </NoticeBox>
        )
    }

    return <h3>Verifying your account…</h3>
}
