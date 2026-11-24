import type { FC } from 'react'
import { deployStatus, ItemPanel, ItemPanelList, NonIdealState, Panel } from '../../../components/index.ts'
import type { LiveComponents } from '../../../hooks/use-live-components.ts'
import { useStacks } from '../../../hooks/use-stacks.ts'
import { Deployment, DeploymentInstance, DeploymentInstanceDeployState } from '../../../types/index.ts'
import { endpointUrl, ownEndpoint } from '../../../utils/stack-endpoints.ts'
import { deploymentStatus } from '../list/component-health.ts'
import { InstanceComponentsSection } from './instance-components-section.tsx'
import { InstanceUrl } from './instance-url.tsx'

/* The stacks a deployment is made of, each with its components inside it. The dot on a stack is the
 * same judgement as the one beside the page title, for that stack alone: a failed or running deploy
 * first, since its components cannot explain it, otherwise their health now, so a deployed stack
 * with a crashing component is not green. Until the components arrive it says how the deploy went.
 * A stack that serves a page gets its own address; what acts on the whole deployment is in the page header. */
export const DeploymentStacks: FC<{ deployment: Deployment; components: LiveComponents }> = ({ deployment, components }) => {
    const { instances, loading, error, refetch } = components
    const { stacks: definitions } = useStacks()
    const stacks = (deployment.instances ?? []) as (DeploymentInstance & DeploymentInstanceDeployState)[]

    if (stacks.length === 0) {
        return (
            <Panel title="Stacks">
                <NonIdealState variant="empty" title="No stacks" description="Stacks can only be added when you create an instance." />
            </Panel>
        )
    }

    return (
        <ItemPanelList title="Stacks" hideTitle>
            {stacks.map((stack) => {
                const live = instances?.find((candidate) => candidate.instanceId === stack.id)
                const endpoint = ownEndpoint(definitions.find((definition) => definition.name === stack.stackName))
                return (
                    <ItemPanel
                        key={stack.id}
                        title={stack.stackName}
                        status={deploymentStatus([stack], live && [live]) ?? deployStatus(stack)}
                        meta={{
                            url: endpoint && deployment.group?.hostname && <InstanceUrl url={endpointUrl(deployment.group, stack.name, endpoint)} />,
                        }}
                    >
                        {live ? (
                            <InstanceComponentsSection instanceComponents={live} instance={stack} onChanged={refetch} />
                        ) : loading && !instances ? (
                            /* The listing queries the cluster for every component of every
                             * instance, so it is slow by nature; show that something is happening. */
                            <NonIdealState variant="loading" title="Loading components from the cluster…" dataTest="deployment-components-loading" />
                        ) : error && !loading ? (
                            <NonIdealState variant="error" title="Couldn't load components" description="The server may be older than this app and not report components yet." />
                        ) : null}
                    </ItemPanel>
                )
            })}
        </ItemPanelList>
    )
}
