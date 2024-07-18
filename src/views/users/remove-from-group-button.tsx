import { Button, Center, CircularLoader, IconSubtract16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { useAuthAxios } from '../../hooks'
import { useAlert } from '@dhis2/app-service-alerts'

type RemoveFromGroupButtonProps = {
    group: string
    userId: number
    onComplete: () => void
}

export const RemoveFromGroupButton: FC<RemoveFromGroupButtonProps> = ({ group, userId, onComplete }) => {
    const [{ loading }, removeUser] = useAuthAxios(
        {
            url: `/groups/${group}/users/${userId}`,
            method: 'delete',
        },
        { manual: true }
    )

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const submit = useCallback(async () => {
        try {
            await removeUser()
            showAlert({ message: 'User removed from group successfully', isCritical: false })
        } catch (error) {
            showAlert({ message: 'Error while removing user from group', isCritical: true })
            console.log(error)
        }
        onComplete()
    }, [onComplete, removeUser, showAlert])

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    return (
        <>
            <Button icon={<IconSubtract16 />} onClick={submit} />
        </>
    )
}
