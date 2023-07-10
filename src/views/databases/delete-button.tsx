import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
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
    const [{ response, loading, error }, deleteDatabase] = useAuthAxios<Database>(
        {
            url: `databases/${id}`,
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

    const onConfirm = useCallback(() => {
        deleteDatabase()
        setShowConfirmationModal(false)
    }, [deleteDatabase, setShowConfirmationModal])

    useEffect(() => {
        if (response?.status === 202 && !loading) {
            showAlert({ message: `Successfully deleted ${groupName}/${databaseName}`, isCritical: false })
            onComplete()
        }
    }, [onComplete, response, showAlert, groupName, databaseName, loading])

    useEffect(() => {
        if (error && !loading) {
            showAlert({ message: `There was an error when deleting ${groupName}/${databaseName}`, isCritical: true })
        }
    }, [error, showAlert, groupName, databaseName, loading])

    return (
        <>
            <Button small destructive loading={loading} icon={<IconDelete16 />} onClick={onClick}>
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
