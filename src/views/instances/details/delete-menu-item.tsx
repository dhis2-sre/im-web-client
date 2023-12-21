import { useAlert } from '@dhis2/app-service-alerts'
import { MenuItem, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../../components'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import type { FC } from 'react'
import { AsyncActionProps } from './actions-dropdown-menu'

export const DeleteMenuItem: FC<AsyncActionProps> = ({ deploymentId, instanceId, onComplete, onStart, stackName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'DELETE',
            url: `/deployments/${deploymentId}/instance/${instanceId}`,
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
        try {
            onStart()
            await deleteInstance()
            showAlert({ message: `Successfully deleted instance "${stackName}"`, isCritical: false })
            onComplete(true)
        } catch (error) {
            onComplete(false)
            showAlert({ message: `There was an error when deleting instance "${stackName}"`, isCritical: true })
            console.error(error)
        }
    }, [deleteInstance, setShowConfirmationModal, stackName, onStart, onComplete, showAlert])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to delete instance "{stackName}"
                </ConfirmationModal>
            )}
            <MenuItem dense label="Delete" destructive disabled={loading} icon={<IconDelete16 />} onClick={onClick} />
        </>
    )
}
