import { FORM_ERROR } from 'final-form'
import { useCallback } from 'react'
import type { AnyObject } from 'react-final-form'
import { useNavigate } from 'react-router'
import { UpdateDeploymentRequest, Deployment } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useDhis2InstanceUpdate } from './use-dhis2-instance-update.ts'

export const useDhis2DeploymentUpdate = (deploymentId: number, deployment?: Deployment) => {
    const navigate = useNavigate()
    const [, executePut] = useAuthAxios(
        {
            url: `/deployments/${deploymentId}`,
            method: 'PUT',
        },
        { manual: true }
    )
    const updateInstance = useDhis2InstanceUpdate(deploymentId)

    const updateDeployment = useCallback(
        async (values: AnyObject) => {
            try {
                // Update deployment
                const payload: UpdateDeploymentRequest = {
                    description: values.description,
                    ttl: values.ttl,
                }
                await executePut({ data: payload })

                // Update instances
                if (deployment?.instances) {
                    for (const instance of deployment.instances) {
                        const stackParams = values[instance.stackName]
                        if (stackParams) {
                            await updateInstance(instance.stackName, stackParams, instance.stackName === 'dhis2-core' ? values.public : undefined)
                        }
                    }
                }

                navigate(`/instances/${deploymentId}/details`)
                return true
            } catch (error) {
                console.error(error)
                return { [FORM_ERROR]: 'Could not update deployment' }
            }
        },
        [executePut, navigate, deploymentId, deployment, updateInstance]
    )

    return updateDeployment
}
