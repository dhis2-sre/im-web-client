import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../components'
import { useAuthAxios } from '../../hooks'
import { Instance } from '../../types'

type DeleteButtonProps = {
    instanceId: number
    instanceName: string
    onComplete: () => void
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ instanceId, onComplete, instanceName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'DELETE',
            url: `instances/${instanceId}`,
        },
        {
            manual: true,
            autoCatch: false,
        }
    )
    const onClick = useCallback(() => {
        setShowConfirmationModal(true)
    }, [setShowConfirmationModal])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
    }, [setShowConfirmationModal])

    const onConfirm = useCallback(async () => {
        setShowConfirmationModal(false)
        try {
            await deleteInstance()
            showAlert({ message: `Successfully deleted instance "${instanceName}"`, isCritical: false })
            onComplete()
        } catch (error) {
            showAlert({ message: `There was an error when deleting instance "${instanceName}"`, isCritical: true })
        }
    }, [deleteInstance, setShowConfirmationModal, instanceName, onComplete, showAlert])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to delete instance "{instanceName}"
                </ConfirmationModal>
            )}
            <Button small secondary loading={loading} disabled={loading} icon={<IconDelete16 />} onClick={onClick}>
                Delete
            </Button>
        </>
    )
}
