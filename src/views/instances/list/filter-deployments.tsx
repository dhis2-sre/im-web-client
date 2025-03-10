import { useState, useMemo, useContext, useEffect } from 'react'
import { AuthContext } from '../../../contexts/auth-context.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { GroupWithDeployments } from '../../../types/index.ts'

const useDeployments = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupWithDeployments[]>('/deployments', {
        useCache: false,
    })

    const [showOnlyMyInstances, setShowOnlyMyInstances] = useState(false)
    const { currentUser } = useContext(AuthContext)

    useEffect(() => {
        const savedShowOnlyMyInstances = localStorage.getItem('showOnlyMyInstances')
        if (savedShowOnlyMyInstances !== null) {
            setShowOnlyMyInstances(JSON.parse(savedShowOnlyMyInstances))
        }
    }, [])

    useEffect(() => {
        if (showOnlyMyInstances) {
            localStorage.setItem('showOnlyMyInstances', JSON.stringify(showOnlyMyInstances))
        }
    }, [showOnlyMyInstances])

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
