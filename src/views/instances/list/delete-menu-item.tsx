import { useAlert } from '@dhis2/app-service-alerts'
import { MenuItem, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { ConfirmationModal } from '../../../components'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import type { FC } from 'react'
import { AsyncActionProps } from './actions-dropdown-menu'

export const DeleteMenuItem: FC<AsyncActionProps> = ({ instanceId, onComplete, onStart, instanceName }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteInstance] = useAuthAxios<Instance>(
        {
            method: 'DELETE',
            url: `/instances/${instanceId}`,
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
            showAlert({ message: `Successfully deleted instance "${instanceName}"`, isCritical: false })
            onComplete()
        } catch (error) {
            onComplete(false)
            showAlert({ message: `There was an error when deleting instance "${instanceName}"`, isCritical: true })
            console.error(error)
        }
    }, [deleteInstance, setShowConfirmationModal, instanceName, onStart, onComplete, showAlert])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to delete instance "{instanceName}"
                </ConfirmationModal>
            )}
            <MenuItem dense label="Delete" destructive disabled={loading} icon={<IconDelete16 />} onClick={onClick} />
        </>
    )
}
