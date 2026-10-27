import { Button } from '@dhis2/ui'
import { FC } from 'react'
import type { ReactNode } from 'react'
import Moment from 'react-moment'
import { useNavigate, useParams } from 'react-router-dom'
import { MetaLine, MomentExpiresFromNow, Page } from '../../../components/index.ts'
import { STACK_NAMES } from '../../../constants.ts'
import { useDeploymentDetails, useLiveComponents } from '../../../hooks/index.ts'
import { Deployment, DeploymentInstanceDeployState } from '../../../types/index.ts'
import { DEPLOYING_REFUSAL, isDeploying } from '../../../utils/deploy-state.ts'
import { deploymentStatus } from '../list/component-health.ts'
import { InstanceActionsMenu } from '../list/instance-actions-menu.tsx'
import { stackUrl } from '../list/open-button.tsx'
import { DeploymentStacks } from './deployment-stacks.tsx'
import { InstanceUrl } from './instance-url.tsx'

/* When it goes away leads, since that is what people check most. DHIS2's address comes last with its
 * buttons, and is left out for a deployment without the stack or a group without a hostname. */
const detailItems = (deployment: Deployment): ReactNode[] => {
    const dhis2 = deployment.instances?.find((instance) => instance.stackName === STACK_NAMES.DHIS2)
    const expired = new Date(deployment.createdAt).getTime() + deployment.ttl * 1000 < Date.now()
    return [
        <>
            {expired ? 'Expired' : 'Expires'} <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
        </>,
        `Owned by ${deployment.user.email}`,
        <>
            Updated <Moment date={deployment.updatedAt} fromNow />
        </>,
        `Group: ${deployment.groupName}`,
        ...(dhis2 && deployment.group?.hostname ? [<InstanceUrl key="url" url={stackUrl(deployment.group, dhis2.name)} />] : []),
    ]
}

export const DeploymentDetails: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [{ data: deployment, error, loading }, refetch] = useDeploymentDetails()
    /* The stacks, the status beside the name and the actions share the one query: it asks the
     * cluster about every component of every instance, and the actions need it to know whether
     * anything can be backed up. */
    const components = useLiveComponents(Number(id))

    return (
        <Page
            parent={{ label: 'Instances', to: '/instances' }}
            title={deployment?.name}
            description={deployment?.description || undefined}
            status={deployment && deploymentStatus((deployment.instances ?? []) as DeploymentInstanceDeployState[], components.instances)}
            band
            actions={
                deployment && (
                    <>
                        <span title={isDeploying(deployment) ? DEPLOYING_REFUSAL : undefined}>
                            <Button small primary disabled={isDeploying(deployment)} onClick={() => navigate(`/instances/${deployment.id}/edit`)}>
                                Edit
                            </Button>
                        </span>
                        <InstanceActionsMenu
                            deployment={deployment}
                            components={components.instances}
                            includeEdit={false}
                            buttons
                            onChanged={() => void refetch()}
                            onDeleted={() => navigate('/instances')}
                        />
                    </>
                )
            }
            loading={loading && !deployment}
            error={error && !deployment ? { title: 'Could not retrieve instance details', description: error.message } : undefined}
            summary={deployment && <MetaLine items={detailItems(deployment)} />}
        >
            {deployment && <DeploymentStacks deployment={deployment} components={components} />}
        </Page>
    )
}
