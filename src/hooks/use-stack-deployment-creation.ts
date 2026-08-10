import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveDeploymentRequest, SaveInstanceRequest, StackCompanion } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

/* Creates a deployment with an instance of the given stack plus any opted-in companion stacks and
 * deploys it. Only the listed parameters are sent for the main stack, so values entered in sections
 * that a visibility condition later hid never reach the backend. A companion the stack gates on a
 * condition is included while that condition holds, since the condition is the opt-in; one offered
 * unconditionally is included when the form's include_<stack> checkbox is set. Confirm-password
 * helper fields are never sent. */
export const useStackDeploymentCreation = (stackName: string, getIncludedParameters: (values: AnyObject) => string[], companions: StackCompanion[] = []) => {
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

                for (const companion of companions) {
                    const included = companion.when ? stackValues[companion.when.parameter] === companion.when.equals : Boolean(values[`include_${companion.name}`])
                    if (!included) {
                        continue
                    }
                    const companionValues: AnyObject = values[companion.name] ?? {}
                    const companionParameters = Object.entries(companionValues).reduce<Record<string, { value: string }>>((payload, [parameterName, value]) => {
                        if (value && !parameterName.endsWith('CONFIRM_PASSWORD')) {
                            payload[parameterName] = { value: String(value) }
                        }
                        return payload
                    }, {})
                    const companionPayload: SaveInstanceRequest = { stackName: companion.name, parameters: companionParameters }
                    await executePost({ url: `/deployments/${deployment.id}/instance`, data: companionPayload })
                }

                await executePost({ url: `/deployments/${deployment.id}/deploy` })
                navigate(`/instances/${deployment.id}/details`)
                return undefined
            } catch (error) {
                console.error(error)
                return { [FORM_ERROR]: error instanceof Error ? error.message : 'Could not create the deployment' }
            }
        },
        [executePost, navigate, stackName, getIncludedParameters, companions]
    )
}
