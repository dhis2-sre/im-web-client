import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconSync16, Tooltip } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'

export const ReplicaRestartButton: FC<{
    instanceId: number
    componentName: string
    replicaName: string
    onChanged: () => void
}> = ({ instanceId, componentName, replicaName, onChanged }) => {
    const [confirming, setConfirming] = useState(false)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading: restarting }, restart] = useAuthAxios(
        {
            method: 'PUT',
            url: `/instances/${instanceId}/restart`,
        },
        { manual: true, autoCancel: false }
    )

    const onConfirm = useCallback(async () => {
        setConfirming(false)
        try {
            await restart({ params: { selector: componentName, replica: replicaName } })
            showAlert({ message: `Successfully requested restart of replica "${replicaName}"`, isCritical: false })
            onChanged()
        } catch (restartError) {
            showAlert({ message: `There was an error when restarting replica "${replicaName}"`, isCritical: true })
            console.error(restartError)
        }
    }, [restart, componentName, replicaName, showAlert, onChanged])

    return (
        <>
            {confirming && (
                <ConfirmationModal onCancel={() => setConfirming(false)} onConfirm={onConfirm}>
                    Are you sure you want to restart replica &quot;{replicaName}&quot;?
                </ConfirmationModal>
            )}
            <Tooltip content="Restart replica">
                <Button small secondary loading={restarting} icon={<IconSync16 />} onClick={() => setConfirming(true)} dataTest={`replica-restart-${replicaName}`} />
            </Tooltip>
        </>
    )
}
