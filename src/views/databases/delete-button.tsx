import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal'
import { useAuthAxios } from '../../hooks'
import { Database } from '../../types'

type DeletButtonProps = {
    id: number
    databaseName: string
    groupName: string
    onComplete: Function
}

export const DeleteButton = ({ id, databaseName, groupName, onComplete }: DeletButtonProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteDatabase] = useAuthAxios<Database>(
        {
            url: `databases/${id}`,
            method: 'delete',
        },
        { manual: true, autoCatch: false }
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
            showAlert({ message: `Successfully deleted ${groupName}/${databaseName}`, isCritical: false })
            onComplete()
        } catch (error) {
            console.error(error)
            showAlert({ message: `There was an error when deleting ${groupName}/${databaseName}`, isCritical: true })
        }
    }, [deleteDatabase, setShowConfirmationModal, showAlert, groupName, databaseName, onComplete])

    return (
        <>
            <Button small secondary loading={loading} icon={<IconDelete16 />} onClick={onClick}>
                Delete
            </Button>
            {showConfirmationModal && (
                <ConfirmationModal destructive onConfirm={onConfirm} onCancel={onCancel}>
                    Are you sure you wish to delete "{groupName}/{databaseName}"?
                </ConfirmationModal>
            )}
        </>
    )
}
