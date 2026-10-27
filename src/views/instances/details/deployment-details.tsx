import { Button } from '@dhis2/ui'
import { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { KeyValueGrid, MomentExpiresFromNow, NonIdealState, Page, Panel } from '../../../components/index.ts'
import type { KeyValueItem } from '../../../components/index.ts'
import { useDeploymentDetails, useLiveComponents } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'
import { DEPLOYING_REFUSAL, isDeploying } from '../../../utils/deploy-state.ts'
import { DeploymentComponents } from './deployment-components.tsx'
import { DeploymentInstancesList } from './deployment-instances-list.tsx'

const overviewItems = (deployment: Deployment): KeyValueItem[] => [
    { label: 'Group', value: deployment.groupName },
    { label: 'Owner', value: deployment.user.email },
    { label: 'Created', value: <Moment date={deployment.createdAt} fromNow /> },
    { label: 'Updated', value: <Moment date={deployment.updatedAt} fromNow /> },
    { label: 'Expires', value: <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} /> },
    ...(deployment.description ? [{ label: 'Description', value: deployment.description }] : []),
]

export const DeploymentDetails: FC = () => {
    const navigate = useNavigate()
    const [{ data: deployment, error, loading }, refetch] = useDeploymentDetails()

    return (
        <Page
            parent={{ label: 'Instances', to: '/instances' }}
            title={deployment?.name}
            actions={
                deployment && (
                    <span title={isDeploying(deployment) ? DEPLOYING_REFUSAL : undefined}>
                        <Button disabled={isDeploying(deployment)} onClick={() => navigate(`/instances/${deployment.id}/edit`)}>
                            Edit
                        </Button>
                    </span>
                )
            }
            loading={loading && !deployment}
            error={error && !deployment ? { title: 'Could not retrieve instance details', description: error.message } : undefined}
        >
            {deployment && (
                <>
                    <Panel title="Overview">
                        <KeyValueGrid items={overviewItems(deployment)} />
                    </Panel>
                    {deployment.instances?.length > 0 ? (
                        <DeploymentStacksAndComponents deployment={deployment} loading={loading} refetch={() => void refetch()} />
                    ) : (
                        <Panel title="Stacks">
                            <NonIdealState
                                variant="empty"
                                title="No stacks connected to this instance"
                                description="Currently you can only add components to an instance when creating one."
                            />
                        </Panel>
                    )}
                </>
            )}
        </Page>
    )
}

/* Mounted only once the deployment has loaded, so the components query has an id to ask about. The
 * stack list and the components section share the one query: it asks the cluster about every
 * component of every instance, and the stack list needs it to know whether anything can be backed
 * up. */
const DeploymentStacksAndComponents: FC<{ deployment: Deployment; loading: boolean; refetch: () => void }> = ({ deployment, loading, refetch }) => {
    const components = useLiveComponents(deployment.id)

    return (
        <>
            <Panel title="Stacks" count={deployment.instances.length} flush>
                <DeploymentInstancesList deployment={deployment} loading={loading} components={components.instances} refetch={refetch} />
            </Panel>
            <DeploymentComponents deployment={deployment} components={components} />
        </>
    )
}
