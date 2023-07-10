import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconSync16 } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmationModal } from '../../components'
import { useAuthAxios } from '../../hooks'
import { Instance } from '../../types'

type RestartButtonProps = {
    instanceId: number
    instanceName: string
    onComplete: () => void
}

export const RestartButton: React.FC<RestartButtonProps> = ({ instanceId, onComplete, instanceName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading, error, response }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'PUT',
            url: `instances/${instanceId}/restart`,
        },
        {
            manual: true,
        }
    )
    const onClick = useCallback(() => {
        setShowConfirmationModal(true)
    }, [setShowConfirmationModal])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
    }, [setShowConfirmationModal])

    const onConfirm = useCallback(() => {
        setShowConfirmationModal(false)
        deleteInstance()
    }, [deleteInstance, setShowConfirmationModal])

    useEffect(() => {
        if (response?.status === 202 && !loading) {
            showAlert({ message: `Successfully restarted instance "${instanceName}"`, isCritical: false })
            onComplete()
        }
    }, [onComplete, response, showAlert, instanceName, loading])

    useEffect(() => {
        if (error && !loading) {
            showAlert({ message: `There was an error when restarting instance "${instanceName}"`, isCritical: true })
        }
    }, [error, showAlert, instanceName, loading])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to restart instance "{instanceName}"
                </ConfirmationModal>
            )}
            <Button small secondary loading={loading} disabled={loading} icon={<IconSync16 />} onClick={onClick}>
                Restart
            </Button>
        </>
    )
}
