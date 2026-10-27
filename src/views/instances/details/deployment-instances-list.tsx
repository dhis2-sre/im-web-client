import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { MomentExpiresFromNow } from '../../../components/index.ts'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import { Deployment, DeploymentInstance, DeploymentInstanceDeployState } from '../../../types/index.ts'
import { Dhis2StackName } from '../parameters.ts'
import { ViewInstanceMenuItem } from './view-instance-menu-item.tsx'

/* The stacks a deployment is made of. Runtime status is not here: the components table below owns it,
 * down to the individual replica, so a single stack-wide status could only repeat it or disagree with
 * it. How the last deploy went is a different question, and one the components table cannot answer,
 * since a stack that failed to deploy has no components to show and no explanation for it. Open
 * resolves the stack's own address; delete and the restart/reset menu act on the whole deployment, so
 * they render once above this table rather than per row. Expires repeats across the rows because the
 * TTL belongs to the deployment, so every stack in it goes at the same moment. */

const DeployStatusCell: FC<{ instance: DeploymentInstance & DeploymentInstanceDeployState }> = ({ instance }) => {
    if (instance.deployStatus === 'failed') {
        return (
            <span title={instance.deployError}>
                <Tag negative>Failed</Tag>
            </span>
        )
    }
    if (instance.deployStatus === 'pending' || instance.deployStatus === 'deploying') {
        return <Tag>Deploying</Tag>
    }
    if (instance.deployStatus === 'deployed') {
        return <Tag positive>Deployed</Tag>
    }
    return null
}

export const DeploymentInstancesList: FC<{
    deployment: Deployment
    loading: boolean
}> = ({ deployment, loading }) => {
    return (
        <DataTable>
            <DataTableHead>
                <DataTableRow>
                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                    <DataTableColumnHeader>Deploy</DataTableColumnHeader>
                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    <DataTableColumnHeader>Expires</DataTableColumnHeader>
                    <DataTableColumnHeader></DataTableColumnHeader>
                </DataTableRow>
            </DataTableHead>
            <DataTableBody loading={loading}>
                {deployment.instances?.map((instance) => {
                    return (
                        <tr key={instance.id}>
                            <DataTableCell staticStyle>{instance.stackName}</DataTableCell>
                            <DataTableCell staticStyle>
                                <DeployStatusCell instance={instance} />
                            </DataTableCell>
                            <DataTableCell staticStyle>
                                <Moment date={instance.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle>
                                <Moment date={instance.updatedAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle>
                                <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
                            </DataTableCell>
                            <DataTableCell staticStyle align="right">
                                {VIEWABLE_INSTANCE_TYPES.includes(instance.stackName) && (
                                    <ViewInstanceMenuItem group={deployment.group} name={instance.name} stackName={instance.stackName as Dhis2StackName} />
                                )}
                            </DataTableCell>
                        </tr>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
