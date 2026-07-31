import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconMore24, Menu, MenuItem, Popover } from '@dhis2/ui'
import { useCallback, useRef, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent } from '../../../types/index.ts'

type RestartTarget = {
    selector: string
}

const describeTarget = (target: RestartTarget) => `component "${target.selector}"`

/* Operations the menu knows how to perform; every other advertised operation is shown disabled so
 * capabilities stay visible until they get an action here. restartReplica is excluded because it
 * is actioned per replica row, not from this menu. */
const actionableOperations = ['restart', 'restartReplica']

export const ComponentOperationsMenu: FC<{
    instanceId: number
    component: InstanceComponent
    onChanged: () => void
}> = ({ instanceId, component, onChanged }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [restartTarget, setRestartTarget] = useState<RestartTarget | null>(null)

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

    const confirmTarget = (target: RestartTarget) => {
        setOpen(false)
        setRestartTarget(target)
    }

    const onConfirmRestart = useCallback(async () => {
        const target = restartTarget
        setRestartTarget(null)
        if (!target) {
            return
        }
        try {
            await restart({ params: target })
            showAlert({ message: `Successfully requested restart of ${describeTarget(target)}`, isCritical: false })
            onChanged()
        } catch (restartError) {
            showAlert({ message: `There was an error when restarting ${describeTarget(target)}`, isCritical: true })
            console.error(restartError)
        }
    }, [restartTarget, restart, showAlert, onChanged])

    return (
        <>
            {restartTarget && (
                <ConfirmationModal onCancel={() => setRestartTarget(null)} onConfirm={onConfirmRestart}>
                    Are you sure you want to restart {describeTarget(restartTarget)}?
                </ConfirmationModal>
            )}
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
                        {component.supportedOperations.includes('restart') && <MenuItem dense label="Restart" onClick={() => confirmTarget({ selector: component.name })} />}
                        {component.supportedOperations
                            .filter((operation) => !actionableOperations.includes(operation))
                            .map((operation) => (
                                <MenuItem dense key={operation} label={operation} disabled />
                            ))}
                    </Menu>
                </Popover>
            )}
        </>
    )
}
