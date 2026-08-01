import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveDeploymentRequest, SaveInstanceRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

/* Creates a deployment with a single instance of the given stack and deploys it. Only the listed
 * parameters are sent, so values entered in sections that a visibility condition later hid never
 * reach the backend. */
export const useStackDeploymentCreation = (stackName: string, getIncludedParameters: (values: AnyObject) => string[]) => {
    const navigate = useNavigate()
    const [, executePost] = useAuthAxios(
        {
            url: '/deployments',
            method: 'POST',
        },
        { manual: true }
    )

    return useCallback(
        async (values: AnyObject) => {
            try {
                const deploymentPayload: SaveDeploymentRequest = {
                    name: values.name,
                    group: values.groupName,
                    description: values.description,
                    ttl: values.ttl,
                }
                const { data: deployment } = await executePost({ data: deploymentPayload })

                const included = new Set(getIncludedParameters(values))
                const stackValues: AnyObject = values[stackName] ?? {}
                const parameters = Object.entries(stackValues).reduce<Record<string, { value: string }>>((payload, [parameterName, value]) => {
                    if (value && included.has(parameterName)) {
                        payload[parameterName] = { value: String(value) }
                    }
                    return payload
                }, {})

                const instancePayload: SaveInstanceRequest = { stackName, parameters, public: values.public }
                await executePost({ url: `/deployments/${deployment.id}/instance`, data: instancePayload })
                await executePost({ url: `/deployments/${deployment.id}/deploy` })
                navigate(`/instances/${deployment.id}/details`)
                return undefined
            } catch (error) {
                console.error(error)
                return { [FORM_ERROR]: error instanceof Error ? error.message : 'Could not create the deployment' }
            }
        },
        [executePost, navigate, stackName, getIncludedParameters]
    )
}
