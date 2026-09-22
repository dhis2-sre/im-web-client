import type { RefetchFunction } from 'axios-hooks'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Deployment } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useNotificationsContext } from './use-notifications-context.ts'

/* To access the deployment details page a user can use the browser's address bar
 * or click on a row in the lists. The list already contains all the individual
 * deployment data that we need so we simply pass it using the router and in this case
 * nothing needs to be fetched. If the user accesses this page directly via a URL,
 * there will be no state on the router, so we do need to fetch the deployment */
export const useDeploymentDetails = (): [
    {
        loading: boolean
        data: Deployment
        error: Error | undefined
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RefetchFunction<any, Deployment>,
] => {
    const { id } = useParams()
    const [{ data, error, loading }, refetch] = useAuthAxios<Deployment>(`/deployments/${id}`, { manual: true, autoCatch: true, autoCancel: false })
    const { lastDeploymentEvent } = useNotificationsContext()

    useEffect(() => {
        if (id) {
            void refetch()
        }
    }, [id, refetch])

    /* Deploying is asynchronous, so the deploy status the page shows only stays true if it is
     * reloaded as the deploy moves. The event says which deployment moved, not what the new status
     * is, so the answer still comes from the endpoint. */
    useEffect(() => {
        if (!id || !lastDeploymentEvent || String(lastDeploymentEvent.data.deploymentId) !== id) {
            return
        }
        void refetch()
    }, [id, lastDeploymentEvent, refetch])

    return [{ data, loading, error }, refetch]
}
