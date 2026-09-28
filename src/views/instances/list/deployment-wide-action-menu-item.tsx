import { useAlert } from '@dhis2/app-service-alerts'
import { IconClockHistory16, IconSync16, MenuItem } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC, ReactElement } from 'react'
import { ConfirmationModal } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DeploymentInstance } from '../../../types/index.ts'
import { OnActionCompletFn } from '../details/action-types.ts'

type DeploymentWideAction = 'restart' | 'reset'

const actionCopy: Record<DeploymentWideAction, { label: string; verb: string; icon: ReactElement; destructive: boolean }> = {
    restart: { label: 'Restart', verb: 'restart', icon: <IconSync16 />, destructive: false },
    reset: { label: 'Reset', verb: 'reset', icon: <IconClockHistory16 />, destructive: true },
}

/* Restart and reset act on the whole deployment: every instance, and within each instance every
 * component, since the endpoints without a selector cover all of them. Instances are walked in the
 * order the deployment lists them, which is the order they were added, so a stack is acted on after
 * whatever it depends on. */
export const DeploymentWideActionMenuItem: FC<{
    action: DeploymentWideAction
    instances: DeploymentInstance[]
    deploymentName: string
    onStart: () => void
    onComplete: OnActionCompletFn
}> = ({ action, instances, deploymentName, onStart, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const { label, verb, icon, destructive } = actionCopy[action]

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, execute] = useAuthAxios({ method: 'PUT', url: '' }, { manual: true, autoCancel: false })

    const onConfirm = useCallback(async () => {
        setShowConfirmationModal(false)
        onStart()
        try {
            for (const instance of instances) {
                await execute({ url: `/instances/${instance.id}/${action}` })
            }
            showAlert({ message: `Successfully requested ${verb} of "${deploymentName}"`, isCritical: false })
            onComplete(true)
        } catch (error) {
            onComplete(false)
            showAlert({ message: `There was an error when trying to ${verb} "${deploymentName}"`, isCritical: true })
            console.error(error)
        }
    }, [execute, instances, action, verb, deploymentName, showAlert, onStart, onComplete])

    return (
        <>
            {showConfirmationModal && (
                <ConfirmationModal destructive={destructive} onCancel={() => setShowConfirmationModal(false)} onConfirm={onConfirm}>
                    Are you sure you want to {verb} every component of &quot;{deploymentName}&quot;?
                </ConfirmationModal>
            )}
            <MenuItem dense destructive={destructive} disabled={loading} icon={icon} label={label} onClick={() => setShowConfirmationModal(true)} />
        </>
    )
}
