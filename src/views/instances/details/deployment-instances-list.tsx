import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { deployStatus, MomentExpiresFromNow, StatusIndicator } from '../../../components/index.ts'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import { Deployment, DeploymentInstance, DeploymentInstanceDeployState } from '../../../types/index.ts'
import { OpenButton } from '../list/open-button.tsx'

/* The stacks a deployment is made of. Runtime status is not here: the components table below owns it,
 * down to the individual replica, so a single stack-wide status could only repeat it or disagree with
 * it. How the last deploy went is a different question, and one the components table cannot answer,
 * since a stack that failed to deploy has no components to show and no explanation for it. Open
 * resolves the stack's own address; what acts on the whole deployment is in the page header's
 * actions menu. Expires repeats across the rows because the TTL
 * belongs to the deployment, so every stack in it goes at the same moment. */

const DeployStatusCell: FC<{ instance: DeploymentInstance & DeploymentInstanceDeployState }> = ({ instance }) => {
    const status = deployStatus(instance)
    return status ? <StatusIndicator status={status} /> : null
}

export const DeploymentInstancesList: FC<{ deployment: Deployment; loading: boolean }> = ({ deployment, loading }) => {
    return (
        <DataTable>
            <DataTableHead>
                <DataTableRow>
                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                    <DataTableColumnHeader>Deploy</DataTableColumnHeader>
                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    <DataTableColumnHeader>Expires</DataTableColumnHeader>
                    <DataTableColumnHeader />
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
                                    <OpenButton group={deployment.group} name={instance.name} stackName={instance.stackName} />
                                )}
                            </DataTableCell>
                        </tr>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
