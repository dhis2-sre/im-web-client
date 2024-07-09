import { useAuthAxios } from '../../../hooks'
import { GroupsWithDeployments } from '../../../types'
import { useState, useMemo } from 'react'

const CURRENT_USER_LOCAL_STORAGE_KEY = "DHIS2_IM_CURRENT_USER";

const useDeployments = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDeployments[]>('/deployments', {
        useCache: false,
    })
    const [showOnlyMyInstances, setShowOnlyMyInstances] = useState(false)

    const getCurrentUserFromLocalStorage = () => {
        const user = localStorage.getItem(CURRENT_USER_LOCAL_STORAGE_KEY);
        return user ? JSON.parse(user) : null;
    }

    const currentUser = useMemo(() => getCurrentUserFromLocalStorage(), []);

    const filterDeploymentsByUser = useMemo(() => {
        if (!currentUser) return data;

        return data?.map(group => ({
            ...group,
            deployments: group.deployments.filter(deployment => deployment.user.id === currentUser.id)
        }))

    }, [data, currentUser]);

    const filteredData = showOnlyMyInstances ? filterDeploymentsByUser : data;

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
