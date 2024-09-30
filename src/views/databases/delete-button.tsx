import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/index.ts'

interface DeleteButtonProps {
    databaseId: string
    onComplete: () => void
}

export const DeleteButton: FC<DeleteButtonProps> = ({ databaseId, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteDatabase] = useAuthAxios<Database>(
        {
            url: `/databases/${databaseId}`,
            method: 'delete',
        },
        { manual: true }
    )

    const onClick = useCallback(() => {
        setShowConfirmationModal(true)
    }, [setShowConfirmationModal])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
    }, [setShowConfirmationModal])

    const onConfirm = useCallback(async () => {
        try {
            setShowConfirmationModal(false)
            await deleteDatabase()
            showAlert({ message: `Successfully deleted database`, isCritical: false })
            onComplete()
        } catch (error) {
            console.error(error)
            showAlert({ message: `There was an error when deleting database`, isCritical: true })
        }
    }, [deleteDatabase, setShowConfirmationModal, showAlert, onComplete])

    return (
        <>
            <Button small secondary loading={loading} icon={<IconDelete16 />} onClick={onClick}>
                Delete
            </Button>
            {showConfirmationModal && (
                <ConfirmationModal destructive onConfirm={onConfirm} onCancel={onCancel}>
                    Are you sure you wish to delete &quot;database&quot;?
                </ConfirmationModal>
            )}
        </>
    )
}
