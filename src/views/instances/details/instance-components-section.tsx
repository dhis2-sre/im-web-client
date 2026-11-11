import { Button, DataTable, DataTableBody, DataTableCell, DataTableRow } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import type { FC } from 'react'
import { Drawer } from '../../../components/index.ts'
import { useStack } from '../../../hooks/index.ts'
import { DeploymentInstance, DeploymentInstanceComponents, StackWithParameterGroups } from '../../../types/index.ts'
import { groupParametersByComponent } from '../../../utils/component-parameters.ts'
import { ComponentParametersTable } from './component-parameters-table.tsx'
import { ComponentsTable } from './components-table.tsx'
import styles from './instance-components.module.css'

export const InstanceComponentsSection: FC<{
    instanceComponents: DeploymentInstanceComponents
    instance?: DeploymentInstance
    onChanged: () => void
}> = ({ instanceComponents, instance, onChanged }) => {
    const [viewing, setViewing] = useState(false)
    const { stack } = useStack(instanceComponents.stackName)

    const { byComponent, leftover } = useMemo(
        () =>
            groupParametersByComponent(
                instance?.parameters,
                stack as StackWithParameterGroups | undefined,
                instanceComponents.components.map((component) => component.name)
            ),
        [instance?.parameters, stack, instanceComponents.components]
    )

    return (
        <div className={styles.instanceComponents}>
            <ComponentsTable
                instanceId={instanceComponents.instanceId}
                stackName={instanceComponents.stackName}
                components={instanceComponents.components}
                parametersByComponent={byComponent}
                namespace={instance?.group?.namespace}
                instanceName={instanceComponents.instanceName}
                groupId={instance?.group?.id}
                onChanged={onChanged}
            />
            {/* Stacks that declare no parameter groups have nothing to hang off a component, so their
             * parameters stay one list for the whole stack, opened the way a component's are. */}
            {leftover.length > 0 && (
                <DataTable dataTest={`parameters-${instanceComponents.instanceId}`}>
                    <DataTableBody>
                        <DataTableRow>
                            <DataTableCell staticStyle>
                                <button type="button" className={styles.nameLink} onClick={() => setViewing(true)}>
                                    Parameters
                                </button>
                            </DataTableCell>
                            <DataTableCell staticStyle>
                                <span className={styles.muted}>Shared by every component of {instanceComponents.stackName}</span>
                            </DataTableCell>
                            <DataTableCell staticStyle align="right">
                                <Button small secondary aria-label="View parameters" onClick={() => setViewing(true)}>
                                    View
                                </Button>
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableBody>
                </DataTable>
            )}
            {viewing && (
                <Drawer title="Parameters" description={`Shared by every component of ${instanceComponents.stackName}`} onClose={() => setViewing(false)}>
                    <ComponentParametersTable parameters={leftover} />
                </Drawer>
            )}
        </div>
    )
}
