import { Button, Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useParams } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'

export const Validate = () => {
    const { token } = useParams()
    const [{ loading, error }, submit] = useAuthAxios(
        {
            url: '/users/validate',
            method: 'post',
            data: { token },
        },
        { manual: true }
    )
    const [validated, setValidated] = useState<boolean>(false)

    const onSubmit = useCallback(
        async (event) => {
            try {
                await submit()
                setValidated(true)
            } catch (error) {
                console.error(error)
            }
        },
        [submit]
    )

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
            <h3>Token: "{token}"</h3>
            {validated && <h3>Congratulation! Your email has been validated :-)</h3>}
            {error && error.response.status === 404 && (
                <NoticeBox error title="Could not validate">
                    Token not found
                </NoticeBox>
            )}
            <Button primary value="login" onClick={onSubmit} loading={loading}>
                Validate
            </Button>
        </div>
    )
}
