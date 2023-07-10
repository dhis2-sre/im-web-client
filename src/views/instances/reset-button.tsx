import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconClockHistory16 } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmationModal } from '../../components'
import { useAuthAxios } from '../../hooks'
import { Instance } from '../../types'

type ResetButtonProps = {
    instanceId: number
    instanceName: string
    onComplete: () => void
}

export const ResetButton: React.FC<ResetButtonProps> = ({ instanceId, onComplete, instanceName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading, error, response }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'PUT',
            url: `instances/${instanceId}/reset`,
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
        if (response.status === 202 && !loading) {
            showAlert({ message: `Successfully reset instance "${instanceName}"`, isCritical: false })
            onComplete()
        }
    }, [onComplete, response, showAlert, instanceName, loading])

    useEffect(() => {
        if (error && !loading) {
            showAlert({ message: `There was an error when resetting instance "${instanceName}"`, isCritical: true })
        }
    }, [error, showAlert, instanceName, loading])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to reset instance "{instanceName}"
                </ConfirmationModal>
            )}
            <Button
                small
                secondary
                loading={loading}
                disabled={loading}
                icon={<IconClockHistory16 />}
                onClick={onClick}
            >
                Reset
            </Button>
        </>
    )
}
