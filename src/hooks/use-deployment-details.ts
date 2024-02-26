import { useRef, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Deployment } from '../types'
import { useAuthAxios } from './use-auth-axios'
import { RefetchFunction } from 'axios-hooks'

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
    RefetchFunction<any, Deployment>
] => {
    const { state: dataFromRouter } = useLocation()
    const { id } = useParams()
    const getDeploymentCalledRef = useRef(false)
    const [{ data, error, loading }, refetch] = useAuthAxios<Deployment>(`/deployments/${id}`, { manual: true, autoCatch: true, autoCancel: false })

    useEffect(() => {
        if (!dataFromRouter && !getDeploymentCalledRef.current) {
            getDeploymentCalledRef.current = true
            refetch()
        }
    }, [dataFromRouter, refetch])

    return [
        {
            data: data ?? dataFromRouter ?? undefined,
            loading: dataFromRouter ? false : loading,
            error: dataFromRouter ? undefined : error,
        },
        refetch,
    ]
}
