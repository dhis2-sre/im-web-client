import { useAuthAxios } from '../../../hooks'
import { GroupsWithDeployments } from '../../../types'
import { useState } from 'react'

const useDeployments = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDeployments[]>('/deployments', {
        useCache: false,
    })
    const [showOnlyMyInstances, setShowOnlyMyInstances] = useState(false)
    const userData = JSON.parse(localStorage.getItem("DHIS2_IM_CURRENT_USER"))

    const filteredData = showOnlyMyInstances
        ? data?.map(group => ({
            ...group,
            deployments: group.deployments.filter(deployment => deployment.user.id === userData.id)
        }))
        : data

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
