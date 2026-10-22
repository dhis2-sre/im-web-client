import { useState } from 'react'
import type { FC } from 'react'
import { ActionsMenu, useActionAlert } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import { grafanaLogsUrl } from '../../../utils/grafana-logs.ts'
import { LogModal } from './log-modal.tsx'
import { SaveAsModal } from './save-as-modal.tsx'

/* Operations this menu accounts for; every other advertised operation is shown disabled so
 * capabilities stay visible until they get an action here. restartReplica is deliberately not
 * surfaced in the UI, the API keeps it for scripting. databaseSave and filestoreBackup share the
 * one Backup item: the dump and the file store are written together and linked, so the component
 * advertising either capability offers the same backup. logs is offered on the replica rows only,
 * since a log belongs to one pod rather than to the component as a whole. */
const handledOperations = ['restart', 'restartReplica', 'reset', 'databaseSave', 'filestoreBackup', 'logs']

export const ComponentOperationsMenu: FC<{
    instanceId: number
    stackName: string
    component: InstanceComponent
    replica?: InstanceComponentReplica
    namespace?: string
    instanceName?: string
    groupId?: number
    onChanged: () => void
}> = ({ instanceId, stackName, component, replica, namespace, instanceName, groupId, onChanged }) => {
    const [showSaveAs, setShowSaveAs] = useState(false)
    const [showLog, setShowLog] = useState(false)
    const alert = useActionAlert()
    const [, execute] = useAuthAxios({ method: 'PUT', url: '' }, { manual: true, autoCancel: false })

    const grafanaUrl = grafanaLogsUrl({ namespace, instanceName, groupId, component: component.name })
    const supports = (operation: string) => component.supportedOperations.includes(operation)
    const backsUp = supports('databaseSave') || supports('filestoreBackup')

    const act = (action: 'restart' | 'reset') => async () => {
        try {
            await execute({ url: `/instances/${instanceId}/${action}`, params: { selector: component.name } })
            alert.success(`Successfully requested ${action} of component "${component.name}"`)
            onChanged()
        } catch (error) {
            console.error(error)
            alert.error(`There was an error when requesting ${action} of component "${component.name}"`)
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
                    backsUp && { label: 'Backup', onClick: () => setShowSaveAs(true) },
                    supports('logs') && replica && { label: 'Logs', onClick: () => setShowLog(true) },
                    grafanaUrl && { label: 'Logs in Grafana', onClick: () => void window.open(grafanaUrl, '_blank', 'noopener,noreferrer') },
                    ...component.supportedOperations
                        .filter((operation) => !handledOperations.includes(operation))
                        .map((operation) => ({ label: operation, disabled: true, onClick: () => {} })),
                ]}
            />
        </>
    )
}
