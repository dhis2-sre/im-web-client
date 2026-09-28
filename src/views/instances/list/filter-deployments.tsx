import { useState, useMemo, useContext, useCallback, useEffect } from 'react'
import { AuthContext } from '../../../contexts/auth-context.ts'
import { useAuthAxios, useNotificationsContext } from '../../../hooks/index.ts'
import { GroupWithDeployments } from '../../../types/index.ts'

const useDeployments = () => {
    const LOCAL_STORAGE_KEY = 'showOnlyMyInstances'
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupWithDeployments[]>('/deployments', {
        useCache: false,
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

    const [showOnlyMyInstances, _setShowOnlyMyInstances] = useState<boolean>(() => {
        try {
            return !!JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
        } catch {
            return false
        }
    })

    const setShowOnlyMyInstances: typeof _setShowOnlyMyInstances = useCallback(
        (showOnlyMyInstances) => {
            return _setShowOnlyMyInstances((prev) => {
                const resolvedValue = typeof showOnlyMyInstances === 'function' ? showOnlyMyInstances(prev) : showOnlyMyInstances
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resolvedValue))
                return resolvedValue
            })
        },
        [_setShowOnlyMyInstances]
    )

    const { currentUser } = useContext(AuthContext)

    const filteredData = useMemo(() => {
        let filteredGroups = data?.map((group) => ({
            ...group,
            deployments: group.deployments.filter((deployment) => deployment.user.id === currentUser.id),
        }))
        if (filteredGroups) {
            filteredGroups = filteredGroups.filter((group) => group.deployments.length > 0)
        }

        return showOnlyMyInstances ? filteredGroups : data
    }, [data, currentUser, showOnlyMyInstances])

    return {
        data: filteredData,
        error,
        loading,
        refetch,
        showOnlyMyInstances,
        setShowOnlyMyInstances,
    }
}

export default useDeployments
