import { InstanceComponentReplica } from '../types/index.ts'

/* One replica's health as Tag colours: a failed pod is negative, a running and ready pod is
 * positive, anything in between, e.g. pending or not yet ready, is neutral. Shared so the tags on
 * the deployments list and the rows in the components table cannot disagree about a replica. */
export const getReplicaTagProps = (replica: InstanceComponentReplica) => {
    if (replica.phase === 'Failed') {
        return { negative: true }
    }
    if (replica.phase === 'Running' && replica.ready) {
        return { positive: true }
    }
    return { neutral: true }
}

export const replicaStatusLabel = (replica: InstanceComponentReplica) => (replica.ready ? replica.phase : `${replica.phase} (not ready)`)
