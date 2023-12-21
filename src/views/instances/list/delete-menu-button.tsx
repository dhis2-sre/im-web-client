import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../../components'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import type { FC } from 'react'

export const DeleteButton: FC<{
    id: number
    displayName: string
    onComplete: () => void
}> = ({ id, displayName, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, executeDelete] = useAuthAxios<Instance>(
        {
            method: 'DELETE',
            url: `/deployments/${id}`,
        },
        { manual: true, autoCancel: false }
    )
    const onClick = useCallback(
        (_, event) => {
            event.stopPropagation()
            setShowConfirmationModal(true)
        },
        [setShowConfirmationModal]
    )

    const onCancel = useCallback(
        (_, event) => {
            event.stopPropagation()
            setShowConfirmationModal(false)
        },
        [setShowConfirmationModal]
    )

    const onConfirm = useCallback(
        async (_, event) => {
            event.stopPropagation()
            setShowConfirmationModal(false)
            try {
                await executeDelete()
                showAlert({ message: `Successfully deleted instance "${displayName}"`, isCritical: false })
                onComplete()
            } catch (error) {
                console.error(error)
                showAlert({ message: `There was an error when deleting instance "${displayName}"`, isCritical: true })
            }
        },
        [executeDelete, setShowConfirmationModal, displayName, showAlert, onComplete]
    )

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to delete instance "{displayName}"
                </ConfirmationModal>
            )}
            <Button small secondary destructive icon={<IconDelete16 />} onClick={onClick} loading={loading}>
                Delete
            </Button>
        </>
    )
}
