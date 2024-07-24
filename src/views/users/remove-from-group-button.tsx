import { Button, IconDelete16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { useAlert } from '@dhis2/app-service-alerts'
import { ConfirmationModal } from '../../components'

type RemoveFromGroupButtonProps = {
    group: String
    userId: Number
    onComplete: Function
}

export const RemoveFromGroupButton: FC<RemoveFromGroupButtonProps> = ({ group, userId, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
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

    const onClick = (_, event) => {
        event.stopPropagation()
        setShowConfirmationModal(true)
    }

    const onCancel = (_, event) => {
        event.stopPropagation()
        setShowConfirmationModal(false)
    }

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

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={submit}>
                    Are you sure you want to remove the group "{group}" from this user?
                </ConfirmationModal>
            )}
            <Button small secondary destructive icon={<IconDelete16 />} onClick={onClick} disabled={loading}>
                Delete
            </Button>
        </>
    )
}
