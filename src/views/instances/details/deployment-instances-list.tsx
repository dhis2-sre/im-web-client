import { ButtonStrip, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import { Deployment } from '../../../types/index.ts'
import { DeleteButton } from '../list/delete-menu-button.tsx'
import { DeploymentActionsMenu } from '../list/deployment-actions-menu.tsx'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import { ViewInstanceMenuItem } from './view-instance-menu-item.tsx'

/* The stacks a deployment is made of. Status is not here: the components table below owns it, down to
 * the individual replica, so a single stack-wide status could only repeat it or disagree with it.
 * Open resolves the stack's own address, while delete and the actions menu act on the whole
 * deployment, the same three buttons as on the instances list. */
export const DeploymentInstancesList: FC<{
    deployment: Deployment
    loading: boolean
    refetch: () => void
}> = ({ deployment, loading, refetch }) => {
    const navigate = useNavigate()

    return (
        <DataTable>
            <DataTableHead>
                <DataTableRow>
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
                            <DataTableCell staticStyle>{instance.stackName}</DataTableCell>
                            <DataTableCell staticStyle>
                                <Moment date={instance.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle>
                                <Moment date={instance.updatedAt} fromNow />
                            </DataTableCell>
                            <DataTableCell staticStyle align="right">
                                <ButtonStrip>
                                    {VIEWABLE_INSTANCE_TYPES.includes(instance.stackName) && (
                                        <ViewInstanceMenuItem
                                            group={deployment.group}
                                            name={instance.name}
                                            stackName={instance.stackName as Dhis2StackName}
                                            parameters={instance.parameters}
                                        />
                                    )}
                                    <DeleteButton id={deployment.id} displayName={deployment.name} onComplete={() => navigate('/instances')} />
                                    <DeploymentActionsMenu deployment={deployment} refetch={refetch} />
                                </ButtonStrip>
                            </DataTableCell>
                        </tr>
                    )
                })}
            </DataTableBody>
        </DataTable>
    )
}
