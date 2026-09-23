import { DataTableCell, ButtonStrip } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { MomentExpiresFromNow } from '../../../components/index.ts'
import { useLiveComponents } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'
import { DeleteButton } from './delete-menu-button.tsx'
import { DeploymentActionsMenu } from './deployment-actions-menu.tsx'
import { DeploymentComponentTags } from './deployment-component-tags.tsx'
import styles from './instances-list.module.css'
import { OpenButton } from './open-button.tsx'

/* One components fetch per row, shared by the tags and the actions menu: both need the same view,
 * and the menu decides what it can offer from the operations the components advertise. */
export const DeploymentRow: FC<{ deployment: Deployment; onNavigate: (deployment: Deployment) => void; refetch: () => void }> = ({ deployment, onNavigate, refetch }) => {
    const { instances, loading, error } = useLiveComponents(deployment.id)

    return (
        <tr
            className={styles.clickableRow}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('[data-test="dhis2-uicore-modal"]')) {
                    return
                }
                onNavigate(deployment)
            }}
        >
            <DataTableCell>{deployment.name}</DataTableCell>
            <DataTableCell>
                <DeploymentComponentTags instances={instances} loading={loading} error={error} />
            </DataTableCell>
            <DataTableCell>
                <Moment date={deployment.createdAt} fromNow />
            </DataTableCell>
            <DataTableCell>
                <Moment date={deployment.updatedAt} fromNow />
            </DataTableCell>
            <DataTableCell>{deployment.user.email}</DataTableCell>
            <DataTableCell>
                <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
            </DataTableCell>
            <DataTableCell>
                <ButtonStrip>
                    <OpenButton deployment={deployment} />
                    <DeleteButton id={deployment.id} displayName={deployment.name} onComplete={refetch} />
                    <DeploymentActionsMenu deployment={deployment} components={instances} refetch={refetch} />
                </ButtonStrip>
            </DataTableCell>
        </tr>
    )
}
