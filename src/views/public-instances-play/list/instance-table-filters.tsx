import { DEPLOYMENT_NAME, INSTANCE_NAME, STACK_NAMES } from '../../../constants.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'

export interface CategorizedDeployments {
    stable: Deployment[]
    canary: Deployment[]
    underDevelopment: Deployment[]
}

const getCoreInstanceLink = (deployments: Deployment) => {
    const coreInstance = deployments.instances.find((instance) => instance.stackName === STACK_NAMES.CORE)
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
        if (deployment.name.includes(INSTANCE_NAME.DEV)) {
            categories.underDevelopment.push(deployment)
        } else if (deployment.name.includes(INSTANCE_NAME.STABLE)) {
            categories.canary.push(deployment)
        } else {
            categories.stable.push(deployment)
        }
    })

    return categories
}

export const useInstanceTableData = () => {
    const [{ data: groupsWithDeployments, error, loading }] = useAuthAxios('/deployments/public', { useCache: true })
    const playGroup = groupsWithDeployments?.filter((groupWithDeployments) => groupWithDeployments.name === DEPLOYMENT_NAME.PLAY)

    const coreDeployments = filterInstancesByCondition(playGroup, (deployment) => deployment.instances.some((instance) => instance.stackName === STACK_NAMES.CORE))

    const categorizedCoreDeployments = categorizeInstances(coreDeployments)

    return {
        groupsWithDeployments,
        error,
        loading,
        getCoreInstanceLink,
        categorizedCoreDeployments,
    }
}
