import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconMore24, Menu, MenuItem, Popover } from '@dhis2/ui'
import { useCallback, useRef, useState } from 'react'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent } from '../../../types/index.ts'
import { SaveAsModal } from './save-as-modal.tsx'

/* Operations the menu knows how to perform; every other advertised operation is shown disabled so
 * capabilities stay visible until they get an action here. restartReplica is deliberately not
 * surfaced in the UI, the API keeps it for scripting. */
const handledOperations = ['restart', 'restartReplica', 'databaseSave']

export const ComponentOperationsMenu: FC<{
    instanceId: number
    stackName: string
    component: InstanceComponent
    onChanged: () => void
}> = ({ instanceId, stackName, component, onChanged }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [showSaveAs, setShowSaveAs] = useState(false)

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
                        {component.supportedOperations.includes('databaseSave') && (
                            <MenuItem
                                dense
                                label="Save database as"
                                onClick={() => {
                                    setOpen(false)
                                    setShowSaveAs(true)
                                }}
                            />
                        )}
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
