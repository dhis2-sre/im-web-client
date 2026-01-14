import type { RefetchFunction } from 'axios-hooks'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Deployment } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

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

    useEffect(() => {
        if (id) {
            void refetch()
        }
    }, [id, refetch])

    return [{ data, loading, error }, refetch]
}
