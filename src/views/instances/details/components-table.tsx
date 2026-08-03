import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, Tag } from '@dhis2/ui'
import { Fragment } from 'react'
import type { FC } from 'react'
import Moment from 'react-moment'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import { ComponentOperationsMenu } from './component-operations-menu.tsx'

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
    onChanged: () => void
}> = ({ instanceId, stackName, components, onChanged }) => (
    <DataTable dataTest="instance-components">
        <DataTableHead>
            <DataTableRow>
                <DataTableColumnHeader>Status</DataTableColumnHeader>
                <DataTableColumnHeader>Component</DataTableColumnHeader>
                <DataTableColumnHeader>Replica</DataTableColumnHeader>
                <DataTableColumnHeader>Restarts</DataTableColumnHeader>
                <DataTableColumnHeader>Created</DataTableColumnHeader>
                <DataTableColumnHeader></DataTableColumnHeader>
            </DataTableRow>
        </DataTableHead>
        <DataTableBody>
            {components.map((component) => (
                <Fragment key={component.name}>
                    {component.replicas.map((replica, index) => (
                        <DataTableRow key={replica.name}>
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
                        </DataTableRow>
                    ))}
                    {component.replicas.length === 0 && (
                        <DataTableRow>
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
            ))}
        </DataTableBody>
    </DataTable>
)
