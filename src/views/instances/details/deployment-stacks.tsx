import type { FC } from 'react'
import Moment from 'react-moment'
import { deployStatus, ItemPanel, ItemPanelList, NonIdealState, Panel } from '../../../components/index.ts'
import { VIEWABLE_INSTANCE_TYPES } from '../../../constants.ts'
import type { LiveComponents } from '../../../hooks/use-live-components.ts'
import { Deployment, DeploymentInstance, DeploymentInstanceDeployState } from '../../../types/index.ts'
import { deploymentStatus } from '../list/component-health.ts'
import { OpenButton } from '../list/open-button.tsx'
import { InstanceComponentsSection } from './instance-components-section.tsx'

/* The stacks a deployment is made of, each with its components inside it. The dot on a stack is the
 * same judgement as the one beside the page title, for that stack alone: a failed or running deploy
 * first, since its components cannot explain it, otherwise their health now, so a deployed stack
 * with a crashing component is not green. Until the components arrive it says how the deploy went.
 * Open resolves the stack's own address; what acts on the whole deployment is in the page header. */
export const DeploymentStacks: FC<{ deployment: Deployment; components: LiveComponents }> = ({ deployment, components }) => {
    const { instances, loading, error, refetch } = components
    const stacks = (deployment.instances ?? []) as (DeploymentInstance & DeploymentInstanceDeployState)[]

    if (stacks.length === 0) {
        return (
            <Panel title="Stacks">
                <NonIdealState variant="empty" title="No stacks connected to this instance" description="Currently you can only add components to an instance when creating one." />
            </Panel>
        )
    }

    return (
        <ItemPanelList title="Stacks">
            {stacks.map((stack) => {
                const live = instances?.find((candidate) => candidate.instanceId === stack.id)
                return (
                    <ItemPanel
                        key={stack.id}
                        title={stack.stackName}
                        status={deploymentStatus([stack], live && [live]) ?? deployStatus(stack)}
                        meta={[
                            <>
                                Created <Moment date={stack.createdAt} fromNow />
                            </>,
                            <>
                                Updated <Moment date={stack.updatedAt} fromNow />
                            </>,
                        ]}
                        actions={VIEWABLE_INSTANCE_TYPES.includes(stack.stackName) && <OpenButton group={deployment.group} name={stack.name} stackName={stack.stackName} />}
                    >
                        {live ? (
                            <InstanceComponentsSection instanceComponents={live} instance={stack} onChanged={refetch} />
                        ) : loading && !instances ? (
                            /* The listing queries the cluster for every component of every
                             * instance, so it is slow by nature; show that something is happening. */
                            <NonIdealState variant="loading" title="Fetching components from the cluster…" dataTest="deployment-components-loading" />
                        ) : error && !loading ? (
                            <NonIdealState variant="error" title="Could not load components" description="Is the backend up to date?" />
                        ) : null}
                    </ItemPanel>
                )
            })}
        </ItemPanelList>
    )
}
