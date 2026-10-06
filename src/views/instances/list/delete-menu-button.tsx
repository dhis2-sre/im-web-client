import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DeploymentInstance } from '../../../types/index.ts'
import { DEPLOYING_REFUSAL, refusalMessage } from '../../../utils/deploy-state.ts'

export const DeleteButton: FC<{
    id: number
    displayName: string
    deploying?: boolean
    onComplete: () => void
}> = ({ id, displayName, deploying, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, executeDelete] = useAuthAxios<DeploymentInstance>(
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
                showAlert({ message: refusalMessage(error, `There was an error when deleting instance "${displayName}"`), isCritical: true })
            }
        },
        [executeDelete, setShowConfirmationModal, displayName, showAlert, onComplete]
    )

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive onCancel={onCancel} onConfirm={onConfirm}>
                    Are you sure you want to delete instance &quot;{displayName}&quot;
                </ConfirmationModal>
            )}
            {/* A disabled button never runs its own onClick, so without this the click is retargeted
                to the row and navigates away instead of doing nothing. */}
            <span title={deploying ? DEPLOYING_REFUSAL : undefined} onClick={(event) => event.stopPropagation()}>
                <Button small secondary destructive icon={<IconDelete16 />} onClick={onClick} loading={loading} disabled={deploying}>
                    Delete
                </Button>
            </span>
        </>
    )
}
