import { useState, useMemo, useContext, useCallback } from 'react'
import { AuthContext } from '../../../contexts/auth-context.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { GroupWithDeployments } from '../../../types/index.ts'

const useDeployments = () => {
    const LOCAL_STORAGE_KEY = 'showOnlyMyInstances'
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupWithDeployments[]>('/deployments', {
        useCache: false,
    })

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

    const [searchTerm, setSearchTerm] = useState('')

    const { currentUser } = useContext(AuthContext)

    const filteredData = useMemo(() => {
        let groups = showOnlyMyInstances
            ? data
                  ?.map((group) => ({
                      ...group,
                      deployments: group.deployments.filter((deployment) => deployment.user.id === currentUser.id),
                  }))
                  ?.filter((group) => group.deployments.length > 0)
            : data

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            groups = groups
                ?.map((group) => ({
                    ...group,
                    deployments: group.deployments.filter(
                        (d) => d.name?.toLowerCase().includes(term) || d.description?.toLowerCase().includes(term) || d.user?.email?.toLowerCase().includes(term)
                    ),
                }))
                ?.filter((group) => group.deployments.length > 0)
        }

        return groups
    }, [data, currentUser, showOnlyMyInstances, searchTerm])

    return {
        data: filteredData,
        error,
        loading,
        refetch,
        showOnlyMyInstances,
        setShowOnlyMyInstances,
        searchTerm,
        setSearchTerm,
    }
}

export default useDeployments
