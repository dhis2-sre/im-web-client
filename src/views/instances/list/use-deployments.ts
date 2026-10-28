import { useEffect, useState } from 'react'
import { useAuthAxios, useNotificationsContext } from '../../../hooks/index.ts'
import { GroupWithDeployments } from '../../../types/index.ts'

export const useDeployments = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupWithDeployments[]>('/deployments', {
        useCache: false,
        autoCatch: true,
        autoCancel: false,
    })

    /* The row offers no delete while its deployment is deploying, so the list has to follow the
     * deploy rather than show whatever was true when it loaded. The event says which deployment
     * moved, not what the new status is, so the answer still comes from the endpoint. Counting the
     * events lets a burst that lands in one render reload the list once. */
    const { onDeploymentEvent } = useNotificationsContext()
    const [moves, setMoves] = useState(0)
    useEffect(() => onDeploymentEvent(() => setMoves((count) => count + 1)), [onDeploymentEvent])
    useEffect(() => {
        if (moves) {
            void refetch()
        }
    }, [moves, refetch])

    return { groups: data, error, loading, refetch }
}
