import { Button, IconAdd24 } from '@dhis2/ui'
import { createContext, useContext } from 'react'
import type { FC, ReactNode } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { ListPage, OnlyMineFilter } from '../../../components/index.ts'
import type { ListColumn } from '../../../components/index.ts'
import { useLiveComponents } from '../../../hooks/index.ts'
import type { LiveComponents } from '../../../hooks/use-live-components.ts'
import type { Deployment } from '../../../types/index.ts'
import { DeploymentComponentTags } from './deployment-component-tags.tsx'
import { ExpiresCell } from './expires-cell.tsx'
import { InstanceActionsMenu } from './instance-actions-menu.tsx'
import { OpenButton } from './open-button.tsx'
import { useDeployments } from './use-deployments.ts'

/* One components fetch per row, shared by the status tags and the actions menu: both need the same
 * view, and the menu decides what it can offer from the operations the components advertise. */
const RowComponents = createContext<LiveComponents | undefined>(undefined)

const RowComponentsScope: FC<{ row: Deployment; children: ReactNode }> = ({ row, children }) => (
    <RowComponents.Provider value={useLiveComponents(row.id)}>{children}</RowComponents.Provider>
)

const StatusCell: FC = () => {
    const live = useContext(RowComponents)
    return <DeploymentComponentTags instances={live?.instances} loading={live?.loading ?? false} error={live?.error} />
}

const RowActions: FC<{ deployment: Deployment; refetch: () => void }> = ({ deployment, refetch }) => {
    const live = useContext(RowComponents)

    return (
        <>
            <OpenButton group={deployment.group} name={deployment.name} />
            <InstanceActionsMenu deployment={deployment} components={live?.instances} onChanged={refetch} onDeleted={refetch} />
        </>
    )
}

const columns: ListColumn<Deployment>[] = [
    { key: 'name', label: 'Name', render: (deployment) => deployment.name, sortValue: (deployment) => deployment.name, breakAnywhere: true },
    { key: 'status', label: 'Status', render: () => <StatusCell /> },
    {
        key: 'expires',
        label: 'Expires',
        render: (deployment) => <ExpiresCell deployment={deployment} />,
        sortValue: (deployment) => new Date(deployment.createdAt).getTime() + deployment.ttl * 1000,
        nowrap: true,
    },
    { key: 'owner', label: 'Owner', render: (deployment) => deployment.user.email, sortValue: (deployment) => deployment.user.email, breakAnywhere: true },
    { key: 'updated', label: 'Updated', render: (deployment) => <Moment date={deployment.updatedAt} fromNow />, sortValue: (deployment) => deployment.updatedAt, nowrap: true },
]

export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const { groups, total, error, loading, refetch, onlyMine, setOnlyMine } = useDeployments()
    const refresh = () => void refetch()

    return (
        <ListPage
            title="Instances"
            actions={
                <Button primary icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
                </Button>
            }
            filters={<OnlyMineFilter label="Show only my instances" checked={onlyMine} onChange={setOnlyMine} />}
            columns={columns}
            groups={groups?.map((group) => ({ key: group.name ?? '', title: group.name ?? '', rows: group.deployments }))}
            rowKey={(deployment) => deployment.id}
            rowHref={(deployment) => `/instances/${deployment.id}/details`}
            rowScope={RowComponentsScope}
            renderRowActions={(deployment) => <RowActions deployment={deployment} refetch={refresh} />}
            loading={loading}
            error={error ? { title: 'Could not retrieve instances', description: error.message } : undefined}
            empty={
                onlyMine && total > 0
                    ? { title: 'None of the instances are yours', action: <Button onClick={() => setOnlyMine(false)}>Show everyone’s</Button> }
                    : { title: 'No instances' }
            }
        />
    )
}
