import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconMore24, Menu, MenuItem, Popover } from '@dhis2/ui'
import { useCallback, useRef, useState } from 'react'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent } from '../../../types/index.ts'
import { grafanaLogsUrl } from '../../../utils/grafana-logs.ts'
import { LogModal } from './log-modal.tsx'
import { SaveAsModal } from './save-as-modal.tsx'

/* Operations this menu accounts for; every other advertised operation is shown disabled so
 * capabilities stay visible until they get an action here. restartReplica is deliberately not
 * surfaced in the UI, the API keeps it for scripting. databaseSave and filestoreBackup share the
 * one Backup item: the dump and the file store are written together and linked, so the component
 * advertising either capability offers the same backup. logs is offered on the replica rows only,
 * since a log belongs to one pod rather than to the component as a whole. */
const handledOperations = ['restart', 'restartReplica', 'databaseSave', 'filestoreBackup', 'logs']

export const ComponentOperationsMenu: FC<{
    instanceId: number
    stackName: string
    component: InstanceComponent
    replica?: string
    namespace?: string
    deploymentId?: number
    instanceName?: string
    onChanged: () => void
}> = ({ instanceId, stackName, component, replica, namespace, deploymentId, instanceName, onChanged }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [showSaveAs, setShowSaveAs] = useState(false)
    const [showLog, setShowLog] = useState(false)

    const grafanaUrl = grafanaLogsUrl({ namespace, deploymentId, instanceName, component: component.name })

    const backsUp = component.supportedOperations.includes('databaseSave') || component.supportedOperations.includes('filestoreBackup')

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

    const onRestart = useCallback(async () => {
        setOpen(false)
        try {
            await restart({ params: { selector: component.name } })
            showAlert({ message: `Successfully requested restart of component "${component.name}"`, isCritical: false })
            onChanged()
        } catch (restartError) {
            showAlert({ message: `There was an error when restarting component "${component.name}"`, isCritical: true })
            console.error(restartError)
        }
    }, [restart, component.name, showAlert, onChanged])

    return (
        <>
            {showLog && replica && <LogModal instanceId={instanceId} componentName={component.name} replica={replica} onClose={() => setShowLog(false)} />}
            {showSaveAs && <SaveAsModal onClose={() => setShowSaveAs(false)} instanceId={instanceId} stackName={stackName} onStart={() => {}} onComplete={() => {}} />}
            <span ref={anchor}>
                <Button
                    small
                    secondary
                    loading={restarting}
                    icon={<IconMore24 />}
                    onClick={() => setOpen((current) => !current)}
                    dataTest={`component-operations-${component.name}`}
                />
            </span>
            {open && (
                <Popover onClickOutside={() => setOpen(false)} reference={anchor} placement="bottom-start">
                    <Menu>
                        {component.supportedOperations.includes('restart') && <MenuItem dense label="Restart" onClick={onRestart} />}
                        {backsUp && (
                            <MenuItem
                                dense
                                label="Backup"
                                onClick={() => {
                                    setOpen(false)
                                    setShowSaveAs(true)
                                }}
                            />
                        )}
                        {component.supportedOperations.includes('logs') && replica && (
                            <MenuItem
                                dense
                                label="Logs"
                                onClick={() => {
                                    setOpen(false)
                                    setShowLog(true)
                                }}
                            />
                        )}
                        {grafanaUrl && <MenuItem dense label="Logs in Grafana" href={grafanaUrl} target="_blank" onClick={() => setOpen(false)} />}
                        {component.supportedOperations
                            .filter((operation) => !handledOperations.includes(operation))
                            .map((operation) => (
                                <MenuItem dense key={operation} label={operation} disabled />
                            ))}
                    </Menu>
                </Popover>
            )}
        </>
    )
}
