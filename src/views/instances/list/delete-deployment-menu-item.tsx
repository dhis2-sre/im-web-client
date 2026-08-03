import { useAlert } from '@dhis2/app-service-alerts'
import { IconDelete16, MenuItem } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { OnActionCompletFn } from '../details/action-types.ts'

export const DeleteDeploymentMenuItem: FC<{
    deploymentId: number
    displayName: string
    onStart: () => void
    onComplete: OnActionCompletFn
}> = ({ deploymentId, displayName, onStart, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, executeDelete] = useAuthAxios(
        {
            method: 'DELETE',
            url: `/deployments/${deploymentId}`,
        },
        { manual: true, autoCancel: false }
    )

    const onConfirm = useCallback(async () => {
        setShowConfirmationModal(false)
        onStart()
        try {
            await executeDelete()
            showAlert({ message: `Successfully deleted instance "${displayName}"`, isCritical: false })
            onComplete(true)
        } catch (error) {
            onComplete(false)
            showAlert({ message: `There was an error when deleting instance "${displayName}"`, isCritical: true })
            console.error(error)
        }
    }, [executeDelete, displayName, showAlert, onStart, onComplete])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={() => setShowConfirmationModal(false)} onConfirm={onConfirm}>
                    Are you sure you want to delete instance &quot;{displayName}&quot;
                </ConfirmationModal>
            )}
            <MenuItem dense destructive disabled={loading} icon={<IconDelete16 />} label="Delete" onClick={() => setShowConfirmationModal(true)} />
        </>
    )
}
