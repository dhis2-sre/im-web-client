import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { RefetchFunction } from 'axios-hooks'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import { Deployment } from '../../../types/index.ts'
import styles from '../list/instances-list.module.css'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import { ActionsDropdownMenu } from './actions-dropdown-menu.tsx'
import { StatusLabel } from './status-label.tsx'
import { ViewInstanceMenuItem } from './view-instance-menu-item.tsx'

export const DeploymentInstancesList: FC<{
    deployment: Deployment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetch: RefetchFunction<any, Deployment>
    loading: boolean
}> = ({ deployment, refetch, loading }) => {
    const navigate = useNavigate()
    return (
        <DataTable>
            <DataTableHead>
                <DataTableRow>
                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    <DataTableColumnHeader></DataTableColumnHeader>
                    <DataTableColumnHeader></DataTableColumnHeader>
                </DataTableRow>
            </DataTableHead>
            <DataTableBody loading={loading}>
                {deployment.instances?.map((instance) => {
                    const onClick = () => navigate(`/instance/${instance.id}/details`)
                    return (
                        <tr className={styles.clickableRow} key={instance.id}>
                            <DataTableCell staticStyle onClick={onClick}>
                                <StatusLabel instanceId={instance.id} />
                            </DataTableCell>
                            <DataTableCell staticStyle onClick={onClick}>
                                {instance.stackName}
                            </DataTableCell>
                            <DataTableCell staticStyle onClick={onClick}>
                                <Moment date={instance.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle onClick={onClick}>
                                <Moment date={instance.updatedAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle align="right">
                                {VIEWABLE_INSTANCE_TYPES.includes(instance.stackName) && (
                                    <ViewInstanceMenuItem group={deployment.group} name={instance.name} stackName={instance.stackName as Dhis2StackName} />
                                )}
                            </DataTableCell>
                            <DataTableCell staticStyle align="right">
                                <ActionsDropdownMenu deploymentId={deployment.id} instanceId={instance.id} stackName={instance.stackName as Dhis2StackName} refetch={refetch} />
                            </DataTableCell>
                        </tr>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
