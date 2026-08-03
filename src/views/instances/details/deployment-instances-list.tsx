import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import { Deployment } from '../../../types/index.ts'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import { StatusLabel } from './status-label.tsx'
import { ViewInstanceMenuItem } from './view-instance-menu-item.tsx'

/* The stacks a deployment is made of, with the status of each. Operations are not here: they act on
 * the whole deployment from the list page, or on a single component from the components table. */
export const DeploymentInstancesList: FC<{
    deployment: Deployment
    loading: boolean
}> = ({ deployment, loading }) => {
    return (
        <DataTable>
            <DataTableHead>
                <DataTableRow>
                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    <DataTableColumnHeader></DataTableColumnHeader>
                </DataTableRow>
            </DataTableHead>
            <DataTableBody loading={loading}>
                {deployment.instances?.map((instance) => {
                    return (
                        <tr key={instance.id}>
                            <DataTableCell staticStyle>
                                <StatusLabel instanceId={instance.id} />
                            </DataTableCell>
                            <DataTableCell staticStyle>{instance.stackName}</DataTableCell>
                            <DataTableCell staticStyle>
                                <Moment date={instance.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle>
                                <Moment date={instance.updatedAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle align="right">
                                {VIEWABLE_INSTANCE_TYPES.includes(instance.stackName) && (
                                    <ViewInstanceMenuItem
                                        group={deployment.group}
                                        name={instance.name}
                                        stackName={instance.stackName as Dhis2StackName}
                                        parameters={instance.parameters}
                                    />
                                )}
                            </DataTableCell>
                        </tr>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
