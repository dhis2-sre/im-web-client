import { useAlert } from '@dhis2/app-service-alerts'
import { MenuItem, IconSync16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../../components'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import type { FC } from 'react'
import { AsyncActionProps } from './actions-dropdown-menu'

export const RestartMenuItem: FC<AsyncActionProps> = ({ instanceId, onStart, onComplete, stackName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'PUT',
            url: `/instances/${instanceId}/restart`,
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
        setShowConfirmationModal(false)
        onStart()
        try {
            await deleteInstance()
            showAlert({ message: `Successfully restarted instance "${stackName}"`, isCritical: false })
            onComplete()
        } catch (error) {
            onComplete(false)
            showAlert({ message: `There was an error when restarting instance "${stackName}"`, isCritical: true })
            console.error(error)
        }
    }, [setShowConfirmationModal, deleteInstance, showAlert, onComplete, onStart, stackName])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to restart instance "{stackName}"
                </ConfirmationModal>
            )}
            <MenuItem dense disabled={loading} icon={<IconSync16 />} onClick={onClick} label="Restart" />
        </>
    )
}
