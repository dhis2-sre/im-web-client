import { useEffect, useMemo } from 'react'
import { useOnlyMine } from '../../../components/index.ts'
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
     * moved, not what the new status is, so the answer still comes from the endpoint. */
    const { lastDeploymentEvent } = useNotificationsContext()
    useEffect(() => {
        if (!lastDeploymentEvent) {
            return
        }
        void refetch()
    }, [lastDeploymentEvent, refetch])

    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyInstances')

    const groups = useMemo(
        () =>
            data
                ?.map((group) => ({ ...group, deployments: (group.deployments ?? []).filter((deployment) => isShown(deployment.user)) }))
                .filter((group) => group.deployments.length > 0),
        [data, isShown]
    )

    return { groups, total: data?.reduce((sum, group) => sum + (group.deployments?.length ?? 0), 0) ?? 0, error, loading, refetch, onlyMine, setOnlyMine }
}
