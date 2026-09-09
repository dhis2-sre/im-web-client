import { DataTable, DataTableBody, DataTableCell, DataTableRow } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import type { FC } from 'react'
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
    const [expanded, setExpanded] = useState(false)
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
                onChanged={onChanged}
            />
            {/* Stacks that declare no parameter groups have nothing to hang off a component, so their
             * parameters stay one list for the whole instance. */}
            {leftover.length > 0 && (
                <DataTable dataTest={`parameters-${instanceComponents.instanceId}`}>
                    <DataTableBody>
                        <DataTableRow
                            expanded={expanded}
                            onExpandToggle={() => setExpanded((current) => !current)}
                            expandableContent={<ComponentParametersTable parameters={leftover} />}
                        >
                            <DataTableCell staticStyle>
                                <strong>Parameters</strong>
                            </DataTableCell>
                        </DataTableRow>
                    </DataTableBody>
                </DataTable>
            )}
        </div>
    )
}
