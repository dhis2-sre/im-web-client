import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { StatusLabel } from './status-label'
import { ActionsDropdownMenu } from './actions-dropdown-menu'
import { Deployment, DeploymentInstance } from '../../../types'
import { RefetchFunction } from 'axios-hooks'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset'

export const DeploymentInstancesList: FC<{
    deploymentId: number
    instances: DeploymentInstance[]
    refetch: RefetchFunction<any, Deployment>
    loading: boolean
}> = ({ deploymentId, instances, refetch, loading }) => (
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
            {instances?.map((instance) => (
                <DataTableRow key={instance.id}>
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
                        <ActionsDropdownMenu deploymentId={deploymentId} instanceId={instance.id} stackName={instance.stackName as Dhis2StackName} refetch={refetch} />
                    </DataTableCell>
                </DataTableRow>
            ))}
        </DataTableBody>
    </DataTable>
)
