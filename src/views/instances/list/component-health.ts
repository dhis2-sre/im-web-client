import { deployStatus, replicaStatus } from '../../../components/status/statuses.ts'
import type { Status } from '../../../components/status/statuses.ts'
import type { DeploymentInstanceComponents, DeploymentInstanceDeployState } from '../../../types/index.ts'

/* The label carries the stack because the row flattens every instance of the deployment, where a bare
 * component name is ambiguous: a dhis2-v2 instance alongside a chap one has two components called db.
 * DHIS 2 is the default a deployment is built around, so its components stay bare and only what is
 * deployed alongside them is qualified. A component named after its own stack, like pgadmin, is
 * unambiguous already. The details page needs no prefix at all, having a section per instance. */
const componentLabel = (stackName: string, componentName: string) =>
    stackName.startsWith('dhis2') || componentName === stackName ? componentName : `${stackName}:${componentName}`

export type Entry = { key: string; label: string; status: Status }

/* One entry per replica, so one unhealthy replica of a component stays visible instead of being
 * averaged away, and a component with no replicas still counts as pending rather than disappearing. */
export const toEntries = (instances: DeploymentInstanceComponents[]): Entry[] =>
    instances.flatMap((instance) =>
        instance.components.flatMap((component) => {
            const label = componentLabel(instance.stackName, component.name)
            const key = `${instance.instanceId}-${component.name}`
            return component.replicas.length === 0
                ? [{ key, label, status: { label: 'Not running', tone: 'neutral' as const } }]
                : component.replicas.map((replica) => ({ key: `${key}-${replica.name}`, label, status: replicaStatus(replica) }))
        })
    )

export type DeploymentHealth = 'healthy' | 'errors' | 'pending'

/* The deployment as a whole, for filtering: any failed component means it has errors, otherwise any
 * not yet running means it is pending, and only all running is healthy. */
export const deploymentHealth = (instances: DeploymentInstanceComponents[]): DeploymentHealth => {
    const tones = toEntries(instances).map((entry) => entry.status.tone)
    if (tones.includes('negative')) {
        return 'errors'
    }
    if (tones.length === 0 || tones.includes('neutral')) {
        return 'pending'
    }
    return 'healthy'
}

const HEALTH_STATUS: Record<DeploymentHealth, Status> = {
    healthy: { label: 'Healthy', tone: 'positive' },
    errors: { label: 'Has errors', tone: 'negative' },
    pending: { label: 'Pending', tone: 'neutral' },
}

/* The deployment as a whole, for the tag beside its name. A failed or running deploy comes first,
 * since the components cannot explain it; otherwise it is the components' health, in the words of
 * the list's status filter. Nothing while the components are still being asked, or with no stacks. */
export const deploymentStatus = (stacks: DeploymentInstanceDeployState[], components: DeploymentInstanceComponents[] | undefined): Status | undefined => {
    const deploys = stacks.map(deployStatus)
    const deploy = deploys.find((status) => status?.tone === 'negative') ?? deploys.find((status) => status?.tone === 'progress')
    if (deploy) {
        return deploy
    }
    return stacks.length > 0 && components ? HEALTH_STATUS[deploymentHealth(components)] : undefined
}
