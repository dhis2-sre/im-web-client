import { useEffect, useRef, useState } from 'react'
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
 * merging the transient component-status events pushed over SSE. A list showing many deployments
 * passes reloadOnReconnect false so a reconnect doesn't reload them all at once; it gets stale back
 * and reloads each when it chooses. */
export const useLiveComponents = (deploymentId: number, { reloadOnReconnect = true } = {}) => {
    const [{ data, loading, error }, refetch] = useAuthAxios<DeploymentInstanceComponents[]>(
        { url: `/deployments/${deploymentId}/components` },
        { useCache: false, autoCatch: true }
    )
    const { onComponentStatus, streamEpoch } = useNotificationsContext()
    const [instances, setInstances] = useState<DeploymentInstanceComponents[] | undefined>(undefined)
    const [stale, setStale] = useState(false)

    useEffect(() => {
        setInstances(data)
    }, [data])

    // Any load that starts after the gap sees what happened in it.
    useEffect(() => {
        if (loading) {
            setStale(false)
        }
    }, [loading])

    /* Transitions during a gap in the stream, including the gap before it first opens, are never
     * pushed, so reload whenever it comes up rather than leave a view that quietly stopped moving. */
    const connectedEpoch = useRef(streamEpoch)
    useEffect(() => {
        if (streamEpoch === connectedEpoch.current) {
            return
        }
        connectedEpoch.current = streamEpoch
        if (reloadOnReconnect) {
            refetch()
        } else {
            setStale(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streamEpoch])

    useEffect(
        () =>
            onComponentStatus((event) => {
                if (event.deploymentId !== deploymentId) {
                    return
                }
                setInstances((current) => {
                    if (!current) {
                        return current
                    }
                    const patched = applyComponentStatus(current, event)
                    if (!patched) {
                        refetch()
                        return current
                    }
                    return patched
                })
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onComponentStatus, deploymentId]
    )

    return { instances, loading, error, stale, refetch }
}

// The shape the hook returns, so a component can be handed the one shared query as a prop.
export type LiveComponents = ReturnType<typeof useLiveComponents>
