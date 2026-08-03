import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, Tag } from '@dhis2/ui'
import { Fragment, useState } from 'react'
import type { FC } from 'react'
import Moment from 'react-moment'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import { ComponentOperationsMenu } from './component-operations-menu.tsx'
import { ComponentParametersTable } from './component-parameters-table.tsx'

const getReplicaTagProps = (replica: InstanceComponentReplica) => {
    if (replica.phase === 'Failed') {
        return { negative: true }
    }
    if (replica.phase === 'Running' && replica.ready) {
        return { positive: true }
    }
    return { neutral: true }
}

export const ComponentsTable: FC<{
    instanceId: number
    stackName: string
    components: InstanceComponent[]
    parametersByComponent: Record<string, ParameterEntry[]>
    onChanged: () => void
}> = ({ instanceId, stackName, components, parametersByComponent, onChanged }) => {
    const [expanded, setExpanded] = useState<string[]>([])
    const toggle = (component: string) => setExpanded((current) => (current.includes(component) ? current.filter((name) => name !== component) : [...current, component]))

    return (
        <DataTable dataTest="instance-components">
            <DataTableHead>
                <DataTableRow>
                    {/* Aligns with the expand toggle on the rows that carry component parameters. */}
                    <DataTableColumnHeader></DataTableColumnHeader>
                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                    <DataTableColumnHeader>Component</DataTableColumnHeader>
                    <DataTableColumnHeader>Replica</DataTableColumnHeader>
                    <DataTableColumnHeader>Restarts</DataTableColumnHeader>
                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                    <DataTableColumnHeader></DataTableColumnHeader>
                </DataTableRow>
            </DataTableHead>
            <DataTableBody>
                {components.map((component) => {
                    const parameters = parametersByComponent[component.name] ?? []
                    /* A component's parameters hang off its first row. Rows without a toggle of their
                     * own, further replicas and components with no parameters, get a filler cell so
                     * every row stays aligned with the header. */
                    const expandProps = parameters.length
                        ? {
                              expanded: expanded.includes(component.name),
                              onExpandToggle: () => toggle(component.name),
                              expandableContent: <ComponentParametersTable parameters={parameters} />,
                          }
                        : {}

                    const replicaCells = (replica: InstanceComponentReplica, index: number) => (
                        <>
                            <DataTableCell>
                                <Tag {...getReplicaTagProps(replica)}>{replica.ready ? replica.phase : `${replica.phase} (not ready)`}</Tag>
                            </DataTableCell>
                            <DataTableCell>{index === 0 ? component.name : ''}</DataTableCell>
                            <DataTableCell>{replica.name}</DataTableCell>
                            <DataTableCell>{replica.restarts}</DataTableCell>
                            <DataTableCell>
                                <Moment date={replica.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell align="right">
                                {index === 0 && <ComponentOperationsMenu instanceId={instanceId} stackName={stackName} component={component} onChanged={onChanged} />}
                            </DataTableCell>
                        </>
                    )

                    return (
                        <Fragment key={component.name}>
                            {component.replicas.map((replica, index) =>
                                index === 0 ? (
                                    <DataTableRow key={replica.name} {...expandProps}>
                                        {parameters.length === 0 && <DataTableCell></DataTableCell>}
                                        {replicaCells(replica, index)}
                                    </DataTableRow>
                                ) : (
                                    <DataTableRow key={replica.name}>
                                        <DataTableCell></DataTableCell>
                                        {replicaCells(replica, index)}
                                    </DataTableRow>
                                )
                            )}
                            {component.replicas.length === 0 && (
                                <DataTableRow {...expandProps}>
                                    {parameters.length === 0 && <DataTableCell></DataTableCell>}
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell>{component.name}</DataTableCell>
                                    <DataTableCell>No replicas</DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell align="right">
                                        <ComponentOperationsMenu instanceId={instanceId} stackName={stackName} component={component} onChanged={onChanged} />
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                        </Fragment>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
