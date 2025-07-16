import { Center, CircularLoader } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { ClusterResources } from '../../../../types/index.ts'

type GroupSelectHelpTextProps = {
    groupName: string
}

export const GroupSelectHelpText = ({ groupName }: GroupSelectHelpTextProps) => {
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
        return `Error fetching cluster resources: ${error.message}`
    }

    if (loading) {
        return (
            <Center>
                <CircularLoader small />
            </Center>
        )
    }

    return `CPU ${resources.CPU}, Memory ${resources.Memory}${resources.Autoscaled ? ', autoscaled' : ''}`
}
