import type { FC } from 'react'
import { NonIdealState, Panel } from '../../../components/index.ts'
import type { LiveComponents } from '../../../hooks/use-live-components.ts'
import { Deployment } from '../../../types/index.ts'
import { InstanceComponentsSection } from './instance-components-section.tsx'

export const DeploymentComponents: FC<{ deployment: Deployment; components: LiveComponents }> = ({ deployment, components }) => {
    const { instances, loading, error, refetch } = components

    return (
        <Panel title="Components" flush>
            {/* The listing queries the cluster for every component of every instance, so it is slow
             * by nature; show that something is happening rather than nothing. */}
            {loading && !instances && <NonIdealState variant="loading" title="Fetching components from the cluster…" dataTest="deployment-components-loading" />}
            {error && !loading && <NonIdealState variant="error" title="Could not load components" description="Is the backend up to date?" />}
            {(instances ?? []).map((instanceComponents) => (
                <InstanceComponentsSection
                    key={instanceComponents.instanceId}
                    instanceComponents={instanceComponents}
                    instance={deployment.instances?.find((candidate) => candidate.id === instanceComponents.instanceId)}
                    onChanged={refetch}
                />
            ))}
        </Panel>
    )
}
