import { FORM_ERROR } from 'final-form'
import { useCallback } from 'react'
import type { AnyObject } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Deployment, UpdateDeploymentRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useDhis2InstanceUpdate } from './use-dhis2-instance-update.ts'

const CORE_STACK = 'dhis2-core'

export const useDhis2DeploymentUpdate = (deploymentId: number, deployment?: Deployment) => {
    const navigate = useNavigate()
    const [, executePut] = useAuthAxios({ method: 'PUT' }, { manual: true })
    const updateInstance = useDhis2InstanceUpdate(deploymentId)

    return useCallback(
        async (values: AnyObject, initialValues: AnyObject) => {
            try {
                if (values.description !== initialValues.description || values.ttl !== initialValues.ttl) {
                    const payload: UpdateDeploymentRequest = {
                        description: values.description,
                        ttl: values.ttl,
                    }
                    await executePut({ url: `/deployments/${deploymentId}`, data: payload })
                }
            } catch (error) {
                console.error(error)
                return { [FORM_ERROR]: 'Could not update deployment' }
            }

            for (const instance of deployment?.instances ?? []) {
                const stackName = instance.stackName!
                const stackValues: Record<string, string> = values[stackName] ?? {}
                const initialStackValues: Record<string, string> = initialValues[stackName] ?? {}
                const dirtyParameters = Object.fromEntries(
                    Object.keys(initialStackValues)
                        .filter((name) => stackValues[name] !== initialStackValues[name])
                        .map((name) => [name, stackValues[name]])
                )
                const publicChanged = stackName === CORE_STACK && Boolean(values.public) !== Boolean(initialValues.public)

                if (Object.keys(dirtyParameters).length === 0 && !publicChanged) {
                    continue
                }

                try {
                    await updateInstance({
                        instanceId: instance.id!,
                        parameters: dirtyParameters,
                        publicValue: publicChanged ? Boolean(values.public) : undefined,
                    })
                } catch (error) {
                    console.error(error)
                    return { [FORM_ERROR]: `Could not update "${stackName}" instance` }
                }
            }

            navigate(`/instances/${deploymentId}/details`)
            return undefined
        },
        [executePut, navigate, deploymentId, deployment, updateInstance]
    )
}
