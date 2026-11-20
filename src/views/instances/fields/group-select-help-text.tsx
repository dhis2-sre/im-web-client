import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { ClusterResources } from '../../../types/index.ts'

export const useGroupSelectHelpText = (groupName: string): string => {
    const [resources, setResources] = useState<ClusterResources>({})
    const [{ loading, error }, fetchClusterResources] = useAuthAxios<ClusterResources>({ method: 'GET' }, { manual: true, autoCatch: true })
    const loadResources = useCallback(async () => {
        if (!groupName) {
            return
        }
        const { data } = await fetchClusterResources(`/groups/${groupName}/resources`)
        setResources(data)
    }, [fetchClusterResources, groupName])

    useEffect(() => {
        void loadResources()
    }, [loadResources, groupName])

    if (error) {
        return `Couldn't load cluster resources: ${error.message}`
    }

    if (loading) {
        return 'Loading…'
    }

    return `CPU ${resources.CPU}, memory ${resources.Memory}${resources.Autoscaled ? ', autoscaled' : ''}`
}
