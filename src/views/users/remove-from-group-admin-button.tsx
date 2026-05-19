import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconCheckmark16, IconCross16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'

type RemoveFromGroupAdminButtonProps = {
    group: string
    userId: number
    onComplete: () => void
}

export const RemoveFromGroupAdminButton: FC<RemoveFromGroupAdminButtonProps> = ({ group, userId, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [{ loading }, removeGroupAdmin] = useAuthAxios(
        {
            url: `/groups/${group}/admins/${userId}`,
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
            await removeGroupAdmin()
            showAlert({ message: 'Group admin role removed successfully', isCritical: false })
        } catch (error) {
            showAlert({ message: 'Error while removing group admin role', isCritical: true })
        }
        onComplete()
    }, [onComplete, removeGroupAdmin, showAlert])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={submit}>
                    Are you sure you want to remove the group admin role for &quot;{group}&quot; from this user?
                </ConfirmationModal>
            )}
            <Button
                small
                secondary
                icon={hovered ? <IconCross16 /> : <IconCheckmark16 />}
                onClick={onClick}
                disabled={loading}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />
        </>
    )
}
