import { ButtonStrip, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { MomentExpiresFromNow } from '../../../components/index.ts'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import { Deployment, DeploymentInstance, DeploymentInstanceComponents, DeploymentInstanceDeployState } from '../../../types/index.ts'
import { DeleteButton } from '../list/delete-menu-button.tsx'
import { DeploymentActionsMenu } from '../list/deployment-actions-menu.tsx'
import { Dhis2StackName } from '../parameters.ts'
import { ViewInstanceMenuItem } from './view-instance-menu-item.tsx'

/* The stacks a deployment is made of. Runtime status is not here: the components table below owns it,
 * down to the individual replica, so a single stack-wide status could only repeat it or disagree with
 * it. How the last deploy went is a different question, and one the components table cannot answer,
 * since a stack that failed to deploy has no components to show and no explanation for it. Open
 * resolves the stack's own address, while delete and the actions menu act on the whole deployment,
 * the same three buttons as on the instances list. Expires repeats across the rows because the TTL
 * belongs to the deployment, so every stack in it goes at the same moment. */

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
    components?: DeploymentInstanceComponents[]
    refetch: () => void
}> = ({ deployment, loading, components, refetch }) => {
    const navigate = useNavigate()

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
                                <ButtonStrip>
                                    {VIEWABLE_INSTANCE_TYPES.includes(instance.stackName) && (
                                        <ViewInstanceMenuItem group={deployment.group} name={instance.name} stackName={instance.stackName as Dhis2StackName} />
                                    )}
                                    <DeleteButton id={deployment.id} displayName={deployment.name} onComplete={() => navigate('/instances')} />
                                    <DeploymentActionsMenu deployment={deployment} components={components} refetch={refetch} />
                                </ButtonStrip>
                            </DataTableCell>
                        </tr>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
