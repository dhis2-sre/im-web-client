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
        async (values: AnyObject, dirtyFields: Record<string, boolean>) => {
            const dirtyNames = Object.keys(dirtyFields).filter((name) => dirtyFields[name])

            if (dirtyNames.includes('description') || dirtyNames.includes('ttl')) {
                try {
                    const payload: UpdateDeploymentRequest = {
                        description: values.description,
                        ttl: values.ttl,
                    }
                    await executePut({ url: `/deployments/${deploymentId}`, data: payload })
                } catch (error) {
                    console.error(error)
                    return { [FORM_ERROR]: 'Could not update deployment' }
                }
            }

            const dirtyParametersByStack: Record<string, Record<string, string>> = {}
            for (const name of dirtyNames) {
                const dotIndex = name.indexOf('.')
                if (dotIndex === -1) {
                    continue
                }
                const stack = name.slice(0, dotIndex)
                const parameterName = name.slice(dotIndex + 1)
                const stackValues = values[stack] as Record<string, string> | undefined
                const value = stackValues?.[parameterName] ?? ''
                if (value === '') {
                    continue
                }
                if (!dirtyParametersByStack[stack]) {
                    dirtyParametersByStack[stack] = {}
                }
                dirtyParametersByStack[stack][parameterName] = value
            }

            const publicChanged = dirtyNames.includes('public')

            for (const instance of deployment?.instances ?? []) {
                const stackName = instance.stackName!
                const dirtyParameters = dirtyParametersByStack[stackName] ?? {}
                const isCore = stackName === CORE_STACK
                if (Object.keys(dirtyParameters).length === 0 && !(isCore && publicChanged)) {
                    continue
                }

                try {
                    await updateInstance({
                        instanceId: instance.id!,
                        parameters: dirtyParameters,
                        publicValue: isCore && publicChanged ? Boolean(values.public) : undefined,
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
