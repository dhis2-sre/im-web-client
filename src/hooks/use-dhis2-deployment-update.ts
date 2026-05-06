import { FORM_ERROR } from 'final-form'
import { useCallback } from 'react'
import type { AnyObject } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Deployment, UpdateDeploymentRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useDhis2InstanceUpdate } from './use-dhis2-instance-update.ts'

const CORE_STACK = 'dhis2-core'

const parseStackFieldName = (fieldName: string): { stack: string; parameterName: string } | null => {
    const bracket = fieldName.match(/^\['([^']+)'\]\.(.+)$/)
    if (bracket) {
        return { stack: bracket[1], parameterName: bracket[2] }
    }
    const dot = fieldName.match(/^([^.[]+)\.(.+)$/)
    if (dot) {
        return { stack: dot[1], parameterName: dot[2] }
    }
    return null
}

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
                const parsed = parseStackFieldName(name)
                if (!parsed) {
                    continue
                }
                const stackValues = values[parsed.stack] as Record<string, string> | undefined
                if (!dirtyParametersByStack[parsed.stack]) {
                    dirtyParametersByStack[parsed.stack] = {}
                }
                dirtyParametersByStack[parsed.stack][parsed.parameterName] = stackValues?.[parsed.parameterName] ?? ''
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
