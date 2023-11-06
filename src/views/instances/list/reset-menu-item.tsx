import { useAlert } from '@dhis2/app-service-alerts'
import { MenuItem, IconClockHistory16 } from '@dhis2/ui'
import { FC, useCallback, useState } from 'react'
import { ConfirmationModal } from '../../../components'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import { AsyncActionProps } from './actions-dropdown-menu'

export const ResetMenuItem: FC<AsyncActionProps> = ({ instanceId, onComplete, onStart, instanceName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'PUT',
            url: `/instances/${instanceId}/reset`,
        },
        { manual: true, autoCancel: false }
    )
    const onClick = useCallback(() => {
        setShowConfirmationModal(true)
    }, [setShowConfirmationModal])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
    }, [setShowConfirmationModal])

    const onConfirm = useCallback(async () => {
        onStart()
        setShowConfirmationModal(false)
        try {
            await deleteInstance()
            showAlert({ message: `Successfully reset instance "${instanceName}"`, isCritical: false })
            onComplete()
        } catch (error) {
            onComplete(false)
            showAlert({ message: `There was an error when resetting instance "${instanceName}"`, isCritical: true })
            console.error(error)
        }
    }, [setShowConfirmationModal, deleteInstance, showAlert, onComplete, instanceName, onStart])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to reset instance "{instanceName}"
                </ConfirmationModal>
            )}
            <MenuItem dense disabled={loading} icon={<IconClockHistory16 />} onClick={onClick} label="Reset" />
        </>
    )
}
