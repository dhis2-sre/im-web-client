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

    if (error && error.response.status !== 404) {
        return (
            <NoticeBox error title="Could not validate">
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <div>
            {validated && <Navigate to="/login" />}
            <h3>Validating token... {token}</h3>
        </div>
    )
}
