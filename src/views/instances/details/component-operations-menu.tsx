import { useState } from 'react'
import type { FC } from 'react'
import { ActionsMenu, useActionAlert } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import { grafanaLogsUrl } from '../../../utils/grafana-logs.ts'
import { LogModal } from './log-modal.tsx'
import { SaveAsModal } from './save-as-modal.tsx'

export const ComponentOperationsMenu: FC<{
    instanceId: number
    stackName: string
    component: InstanceComponent
    replica?: InstanceComponentReplica
    /* For a replica listed under its component: only what acts on that one replica, since the
     * component's row already offers what acts on all of them. */
    replicaOnly?: boolean
    namespace?: string
    instanceName?: string
    groupId?: number
    onChanged: () => void
}> = ({ instanceId, stackName, component, replica, replicaOnly, namespace, instanceName, groupId, onChanged }) => {
    const [showSaveAs, setShowSaveAs] = useState(false)
    const [showLog, setShowLog] = useState(false)
    const alert = useActionAlert()
    const [, execute] = useAuthAxios({ method: 'PUT', url: '' }, { manual: true, autoCancel: false })

    const grafanaUrl = grafanaLogsUrl({ namespace, instanceName, groupId, component: component.name })
    const supports = (operation: string) => component.supportedOperations.includes(operation) && (!replicaOnly || operation === 'logs')
    const backsUp = supports('databaseSave') || supports('filestoreBackup')

    const act = (action: 'restart' | 'reset') => async () => {
        try {
            await execute({ url: `/instances/${instanceId}/${action}`, params: { selector: component.name } })
            alert.success(`${action === 'restart' ? 'Restart' : 'Reset'} requested for ${component.name}`)
            onChanged()
        } catch (error) {
            console.error(error)
            alert.error(`Couldn't ${action} ${component.name}`)
        }
    }

    return (
        <>
            {showLog && replica && (
                <LogModal instanceId={instanceId} componentName={component.name} replica={replica.name} containers={replica.containers ?? []} onClose={() => setShowLog(false)} />
            )}
            {showSaveAs && <SaveAsModal onClose={() => setShowSaveAs(false)} instanceId={instanceId} stackName={stackName} onStart={() => {}} onComplete={() => {}} />}
            <ActionsMenu
                label={`Actions for ${replica?.name ?? component.name}`}
                dataTest={`component-operations-${component.name}`}
                items={[
                    supports('restart') && {
                        label: 'Restart',
                        confirm: { title: 'Restart component', message: `Restart component "${component.name}"?`, confirmLabel: 'Restart' },
                        onClick: act('restart'),
                    },
                    supports('reset') && {
                        label: 'Reset',
                        destructive: true,
                        confirm: {
                            title: 'Reset component',
                            message: `Reset component "${component.name}"? Its data is replaced with the database the instance was deployed from, and the components reading it are restarted.`,
                            confirmLabel: 'Reset',
                            destructive: true,
                        },
                        onClick: act('reset'),
                    },
                    backsUp && { label: 'Back up', onClick: () => setShowSaveAs(true) },
                    supports('logs') && replica && { label: 'Logs', onClick: () => setShowLog(true) },
                    !replicaOnly && grafanaUrl && { label: 'Logs in Grafana', onClick: () => void window.open(grafanaUrl, '_blank', 'noopener,noreferrer') },
                ]}
            />
        </>
    )
}
