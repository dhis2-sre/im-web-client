import { useEffect, useState } from 'react'
import { ComponentStatusEventData, DeploymentInstanceComponents } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useNotificationsContext } from './use-notifications-context.ts'

/* Merges one replica transition into the fetched component view. Returns null when the event
 * references an instance or component the view does not know, which callers treat as a signal
 * to refetch, e.g. a component appearing for the first time. */
export const applyComponentStatus = (instances: DeploymentInstanceComponents[], event: ComponentStatusEventData): DeploymentInstanceComponents[] | null => {
    const instance = instances.find((candidate) => candidate.instanceId === event.instanceId)
    if (!instance) {
        return null
    }
    const component = instance.components.find((candidate) => candidate.name === event.component)
    if (!component) {
        return null
    }

    const withoutReplica = component.replicas.filter((replica) => replica.name !== event.replica.name)
    const replicas = event.deleted ? withoutReplica : [...withoutReplica, event.replica].sort((a, b) => a.name.localeCompare(b.name))

    return instances.map((candidateInstance) =>
        candidateInstance !== instance
            ? candidateInstance
            : {
                  ...candidateInstance,
                  components: candidateInstance.components.map((candidate) => (candidate !== component ? candidate : { ...candidate, replicas })),
              }
    )
}

/* The deployment's component view: loaded once from the components endpoint, then kept live by
 * merging the transient component-status events pushed over SSE. */
export const useLiveComponents = (deploymentId: number) => {
    const [{ data, loading, error }, refetch] = useAuthAxios<DeploymentInstanceComponents[]>(
        { url: `/deployments/${deploymentId}/components` },
        { useCache: false, autoCatch: true }
    )
    const { lastComponentStatus } = useNotificationsContext()
    const [instances, setInstances] = useState<DeploymentInstanceComponents[] | undefined>(undefined)

    useEffect(() => {
        setInstances(data)
    }, [data])

    useEffect(() => {
        if (!lastComponentStatus || lastComponentStatus.data.deploymentId !== deploymentId) {
            return
        }
        setInstances((current) => {
            if (!current) {
                return current
            }
            const patched = applyComponentStatus(current, lastComponentStatus.data)
            if (!patched) {
                refetch()
                return current
            }
            return patched
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastComponentStatus, deploymentId])

    return { instances, loading, error, refetch }
}
