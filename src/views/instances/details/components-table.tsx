import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, Tag } from '@dhis2/ui'
import { Fragment, useState } from 'react'
import type { FC } from 'react'
import Moment from 'react-moment'
import { InstanceComponent } from '../../../types/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import { getReplicaTagProps, replicaStatusLabel } from '../../../utils/replica-tag.ts'
import { ComponentOperationsMenu } from './component-operations-menu.tsx'
import { ComponentParametersTable } from './component-parameters-table.tsx'

export const ComponentsTable: FC<{
    instanceId: number
    stackName: string
    components: InstanceComponent[]
    parametersByComponent: Record<string, ParameterEntry[]>
    onChanged: () => void
}> = ({ instanceId, stackName, components, parametersByComponent, onChanged }) => {
    /* Keyed per row rather than per component, so expanding one replica of a component does not
     * expand its siblings and repeat the same parameters underneath each of them. */
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    const toggle = (row: string) => setExpandedRows((current) => (current.includes(row) ? current.filter((name) => name !== row) : [...current, row]))

    return (
        <DataTable dataTest="instance-components">
            <DataTableHead>
                <DataTableRow>
                    {/* Aligns with the expand toggle the parameter carrying rows have. */}
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
                    /* Every row of a component names it, expands to its parameters and offers its
                     * operations, so a row is never left blank just because a sibling replica came
                     * first. Components whose stack declares no groups have no parameters to expand,
                     * and get a filler cell instead of the toggle to stay aligned. */
                    const rowProps = (row: string) =>
                        parameters.length
                            ? {
                                  expanded: expandedRows.includes(row),
                                  onExpandToggle: () => toggle(row),
                                  expandableContent: <ComponentParametersTable parameters={parameters} />,
                              }
                            : {}
                    const operations = <ComponentOperationsMenu instanceId={instanceId} stackName={stackName} component={component} onChanged={onChanged} />

                    return (
                        <Fragment key={component.name}>
                            {component.replicas.map((replica) => (
                                <DataTableRow key={replica.name} {...rowProps(replica.name)}>
                                    {parameters.length === 0 && <DataTableCell></DataTableCell>}
                                    <DataTableCell>
                                        <Tag {...getReplicaTagProps(replica)}>{replicaStatusLabel(replica)}</Tag>
                                    </DataTableCell>
                                    <DataTableCell>{component.name}</DataTableCell>
                                    <DataTableCell>{replica.name}</DataTableCell>
                                    <DataTableCell>{replica.restarts}</DataTableCell>
                                    <DataTableCell>
                                        <Moment date={replica.createdAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell align="right">{operations}</DataTableCell>
                                </DataTableRow>
                            ))}
                            {component.replicas.length === 0 && (
                                <DataTableRow {...rowProps(component.name)}>
                                    {parameters.length === 0 && <DataTableCell></DataTableCell>}
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell>{component.name}</DataTableCell>
                                    <DataTableCell>No replicas</DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell align="right">{operations}</DataTableCell>
                                </DataTableRow>
                            )}
                        </Fragment>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
