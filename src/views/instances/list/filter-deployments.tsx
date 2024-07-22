import { useAuthAxios } from '../../../hooks'
import { GroupsWithDeployments } from '../../../types'
import { useState, useMemo, useContext } from 'react'
import { AuthContext } from '../../../contexts/auth-context'

const useDeployments = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDeployments[]>('/deployments', {
        useCache: false,
    })
    const [showOnlyMyInstances, setShowOnlyMyInstances] = useState(false)
    const { currentUser } = useContext(AuthContext)

    const filterDeploymentsByUser = useMemo(() => {
        return data?.map((group) => ({
            ...group,
            deployments: group.deployments.filter((deployment) => deployment.user.id === currentUser.id),
        }))
    }, [data, currentUser])

    const filteredData = showOnlyMyInstances ? filterDeploymentsByUser : data

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
