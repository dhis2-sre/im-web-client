// useInstanceTableData.tsx
import { useAuthAxios } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'

export interface CategorizedDeployments {
    stable: Deployment[]
    canary: Deployment[]
    underDevelopment: Deployment[]
}

const getCoreInstanceLink = (deployments: Deployment) => {
    const coreInstance = deployments.instances.find((instance) => instance.stackName === 'dhis2-core')
    return coreInstance ? `https://${deployments.groupName}.im.dhis2.org/${coreInstance.name}` : '#'
}

const filterInstancesByCondition = (instances, condition: (deployment: Deployment) => boolean): Deployment[] => {
    return instances?.flatMap((group) => group.deployments.filter((deployment) => deployment.public && condition(deployment))) || []
}

const categorizeInstances = (deployments: Deployment[]): CategorizedDeployments => {
    const categories: CategorizedDeployments = {
        stable: [],
        canary: [],
        underDevelopment: [],
    }

    deployments.forEach((deployment) => {
        if (deployment.name.includes('dev')) {
            categories.underDevelopment.push(deployment)
        } else if (deployment.name.includes('nightly')) {
            categories.canary.push(deployment)
        } else {
            categories.stable.push(deployment)
        }
    })

    return categories
}

export const useInstanceTableData = () => {
    const [{ data: groupsWithDeployments, error, loading }] = useAuthAxios('/deployments/public', { useCache: true })
    const playGroup = groupsWithDeployments?.filter(groupWithDeployments => groupWithDeployments.name === "play")

    const coreDeployments = filterInstancesByCondition(playGroup, (deployment) => deployment.instances.some((instance) => instance.stackName === 'dhis2-core'))

    const categorizedCoreDeployments = categorizeInstances(coreDeployments)

    return {
        groupsWithDeployments,
        error,
        loading,
        getCoreInstanceLink,
        categorizedCoreDeployments,
    }
}
