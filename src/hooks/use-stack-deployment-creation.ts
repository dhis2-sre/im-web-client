import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveDeploymentRequest, SaveInstanceRequest, StackCompanion } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

export type DeploymentStepStatus = 'pending' | 'running' | 'success' | 'error'
export type DeploymentStep = { stackName: string; status: DeploymentStepStatus }

/* A stack counts as running from the moment its instance is registered until the deployment
 * finishes, because deploying is one call covering every instance rather than one per stack. */
const SETTLED_PAUSE_MS = 800

/* Creates a deployment with an instance of the given stack plus any opted-in companion stacks and
 * deploys it. Only the listed parameters are sent for the main stack, so values entered in sections
 * that a visibility condition later hid never reach the backend. A companion the stack gates on a
 * condition is included while that condition holds, since the condition is the opt-in; one offered
 * unconditionally is included when the form's include_<stack> checkbox is set. Confirm-password
 * helper fields are never sent. */
export const useStackDeploymentCreation = (stackName: string, getIncludedParameters: (values: AnyObject) => string[], companions: StackCompanion[] = []) => {
    const navigate = useNavigate()
    const [steps, setSteps] = useState<DeploymentStep[]>([])
    const [, executePost] = useAuthAxios(
        {
            url: '/deployments',
            method: 'POST',
        },
        { manual: true }
    )

    const setStatus = useCallback((names: string[], status: DeploymentStepStatus) => {
        setSteps((current) => current.map((step) => (names.includes(step.stackName) ? { ...step, status } : step)))
    }, [])

    const createDeployment = useCallback(
        async (values: AnyObject) => {
            const stackValuesForCompanions: AnyObject = values[stackName] ?? {}
            const includedCompanions = companions.filter((companion) =>
                companion.when ? stackValuesForCompanions[companion.when.parameter] === companion.when.equals : Boolean(values[`include_${companion.name}`])
            )
            const deployedStacks = [stackName, ...includedCompanions.map((companion) => companion.name)]
            setSteps(deployedStacks.map((name) => ({ stackName: name, status: 'pending' })))

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
                setStatus([stackName], 'running')
                await executePost({ url: `/deployments/${deployment.id}/instance`, data: instancePayload })

                for (const companion of includedCompanions) {
                    const companionValues: AnyObject = values[companion.name] ?? {}
                    const companionParameters = Object.entries(companionValues).reduce<Record<string, { value: string }>>((payload, [parameterName, value]) => {
                        if (value && !parameterName.endsWith('CONFIRM_PASSWORD')) {
                            payload[parameterName] = { value: String(value) }
                        }
                        return payload
                    }, {})
                    const companionPayload: SaveInstanceRequest = { stackName: companion.name, parameters: companionParameters }
                    setStatus([companion.name], 'running')
                    await executePost({ url: `/deployments/${deployment.id}/instance`, data: companionPayload })
                }

                await executePost({ url: `/deployments/${deployment.id}/deploy` })
                setStatus(deployedStacks, 'success')
                /* Long enough for the check marks to be seen before the details page replaces them. */
                await new Promise((resolve) => setTimeout(resolve, SETTLED_PAUSE_MS))
                navigate(`/instances/${deployment.id}/details`)
                return undefined
            } catch (error) {
                console.error(error)
                setSteps((current) => current.map((step) => (step.status === 'running' ? { ...step, status: 'error' } : step)))
                return { [FORM_ERROR]: error instanceof Error ? error.message : 'Could not create the deployment' }
            }
        },
        [executePost, navigate, stackName, getIncludedParameters, companions, setStatus]
    )

    return { createDeployment, steps }
}
