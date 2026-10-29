import type { DeploymentInstanceDeployState, InstanceComponent, InstanceComponentReplica } from '../../types/index.ts'

export type StatusTone = 'positive' | 'negative' | 'neutral' | 'progress'
export type Status = { label: string; tone: StatusTone; detail?: string }

/* Two vocabularies, kept apart on purpose. How the last deploy of an instance went is one question;
 * whether its components are healthy now is another. A stack can be deployed and still have no
 * healthy replica, and a stack that failed to deploy has no replicas to ask about. */

/* How the last deploy of an instance went, or nothing for an instance from before deploys reported it. */
export const deployStatus = ({ deployStatus: status, deployError }: DeploymentInstanceDeployState): Status | undefined => {
    if (status === 'failed') {
        return { label: 'Failed', tone: 'negative', detail: deployError }
    }
    if (status === 'pending' || status === 'deploying') {
        return { label: 'Deploying', tone: 'progress' }
    }
    if (status === 'deployed') {
        return { label: 'Deployed', tone: 'positive' }
    }
    return undefined
}

/* One replica's health: a failed pod is negative, a running and ready pod is positive, and anything
 * in between, such as pending or not yet ready, is neutral. Only a running pod says it is not ready,
 * since no other phase ever is. The deployments list and the components table both read it from here,
 * so they cannot disagree about a replica. */
export const replicaStatus = (replica: InstanceComponentReplica): Status => {
    const label = replica.phase === 'Running' && !replica.ready ? 'Running (not ready)' : replica.phase
    if (replica.phase === 'Failed') {
        return { label, tone: 'negative' }
    }
    if (replica.phase === 'Running' && replica.ready) {
        return { label, tone: 'positive' }
    }
    return { label, tone: 'neutral' }
}

/* A component's health across its replicas. One replica speaks for the component in its own words;
 * several are counted, and any failed one makes the whole negative, so one bad copy among healthy
 * siblings is not averaged away. */
export const componentStatus = ({ replicas }: InstanceComponent): Status => {
    if (replicas.length === 0) {
        return { label: 'No replicas', tone: 'neutral' }
    }
    if (replicas.length === 1) {
        return replicaStatus(replicas[0])
    }
    const statuses = replicas.map(replicaStatus)
    const ready = statuses.filter((status) => status.tone === 'positive').length
    const label = `${ready}/${replicas.length} ready`
    if (statuses.some((status) => status.tone === 'negative')) {
        return { label, tone: 'negative' }
    }
    return { label, tone: ready === replicas.length ? 'positive' : 'neutral' }
}
