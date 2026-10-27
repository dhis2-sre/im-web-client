import type { DeploymentInstanceDeployState, InstanceComponentReplica } from '../../types/index.ts'

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
 * in between, such as pending or not yet ready, is neutral. The deployments list and the components
 * table both read it from here, so they cannot disagree about a replica. */
export const replicaStatus = (replica: InstanceComponentReplica): Status => {
    const label = replica.ready ? replica.phase : `${replica.phase} (not ready)`
    if (replica.phase === 'Failed') {
        return { label, tone: 'negative' }
    }
    if (replica.phase === 'Running' && replica.ready) {
        return { label, tone: 'positive' }
    }
    return { label, tone: 'neutral' }
}
