import { isAxiosError } from 'axios'
import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveDeploymentRequest, SaveInstanceRequest, StackCompanion } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

export type DeploymentStepStatus = 'pending' | 'running' | 'success' | 'error'
export type DeploymentStep = { stackName: string; status: DeploymentStepStatus }
export type BulkDeployment = { id: number; name: string }
type BulkDeployRequest = { prefix: string; count: number; group: string; description?: string; ttl?: number; instances: SaveInstanceRequest[] }

/* A stack counts as running while its instance is being registered, and registered once the call
 * returns. Deploying is what happens after that, asynchronously, and is watched on the details page
 * rather than here. */
const SETTLED_PAUSE_MS = 800

/* Creates a deployment with an instance of the given stack plus any opted-in companion stacks and
 * deploys it. Only the listed parameters are sent for the main stack, so values entered in sections
 * that a visibility condition later hid never reach the backend. A companion is included while the
 * condition the stack gates it on holds, since that condition is the opt-in, and a companion
 * declared without one is always included, the same reading the form renders by. Confirm-password
 * helper fields are never sent. Saving a preset stores the same deployment with nothing deployed, and a
 * bulk deploy sends the same instances to be created and deployed under many names. */
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

    const includedCompanionsOf = useCallback(
        (values: AnyObject) => {
            const stackValues: AnyObject = values[stackName] ?? {}
            return companions.filter((companion) => !companion.when || stackValues[companion.when.parameter] === companion.when.equals)
        },
        [stackName, companions]
    )

    const buildInstances = useCallback(
        (values: AnyObject): SaveInstanceRequest[] => {
            const included = new Set(getIncludedParameters(values))
            const stackValues: AnyObject = values[stackName] ?? {}
            const parameters = Object.entries(stackValues).reduce<Record<string, { value: string }>>((payload, [parameterName, value]) => {
                if (value && included.has(parameterName)) {
                    payload[parameterName] = { value: String(value) }
                }
                return payload
            }, {})

            const companionInstances = includedCompanionsOf(values).map((companion): SaveInstanceRequest => {
                const companionValues: AnyObject = values[companion.name] ?? {}
                const companionParameters = Object.entries(companionValues).reduce<Record<string, { value: string }>>((payload, [parameterName, value]) => {
                    if (value && !parameterName.endsWith('CONFIRM_PASSWORD')) {
                        payload[parameterName] = { value: String(value) }
                    }
                    return payload
                }, {})
                return { stackName: companion.name, parameters: companionParameters }
            })

            return [{ stackName, parameters, public: values.public }, ...companionInstances]
        },
        [stackName, getIncludedParameters, includedCompanionsOf]
    )

    const setStatus = useCallback((names: string[], status: DeploymentStepStatus) => {
        setSteps((current) => current.map((step) => (names.includes(step.stackName) ? { ...step, status } : step)))
    }, [])

    const saveDeployment = useCallback(
        async (values: AnyObject, preset: boolean, overwrite = false) => {
            const instances = buildInstances(values)
            setSteps(instances.map((instance) => ({ stackName: instance.stackName ?? '', status: 'pending' })))

            try {
                const deploymentPayload: SaveDeploymentRequest = {
                    name: values.name,
                    group: values.groupName,
                    description: values.description,
                    ttl: values.ttl,
                    preset,
                    overwrite,
                }
                const { data: deployment } = await executePost({ data: deploymentPayload })

                for (const instance of instances) {
                    setStatus([instance.stackName ?? ''], 'running')
                    await executePost({ url: `/deployments/${deployment.id}/instance`, data: instance })
                    setStatus([instance.stackName ?? ''], 'success')
                }

                if (preset) {
                    setSteps([])
                    return undefined
                }

                /* Deploying is accepted rather than performed, so this returns long before anything
                 * runs in the cluster. The details page is where the deploy is watched. */
                await executePost({ url: `/deployments/${deployment.id}/deploy` })
                /* Long enough for the check marks to be seen before the details page replaces them. */
                await new Promise((resolve) => setTimeout(resolve, SETTLED_PAUSE_MS))
                navigate(`/instances/${deployment.id}/details`)
                return undefined
            } catch (error) {
                console.error(error)
                setSteps((current) => current.map((step) => (step.status === 'running' ? { ...step, status: 'error' } : step)))
                const serverMessage = isAxiosError(error) && typeof error.response?.data === 'string' ? error.response.data : undefined
                const taken = isAxiosError(error) && error.response?.status === 409
                if (taken) {
                    setSteps([])
                }
                return {
                    [FORM_ERROR]: serverMessage ?? (error instanceof Error ? error.message : `Could not ${preset ? 'save the preset' : 'create the deployment'}`),
                    ...(preset && { taken }),
                }
            }
        },
        [executePost, navigate, buildInstances, setStatus]
    )

    const createDeployment = useCallback((values: AnyObject) => saveDeployment(values, false), [saveDeployment])
    const savePreset = useCallback((values: AnyObject, overwrite = false) => saveDeployment(values, true, overwrite), [saveDeployment])

    const bulkDeploy = useCallback(
        async (values: AnyObject, prefix: string, count: number): Promise<{ deployments?: BulkDeployment[]; error?: string }> => {
            const payload: BulkDeployRequest = {
                prefix,
                count,
                group: values.groupName,
                description: values.description,
                ttl: values.ttl,
                instances: buildInstances(values),
            }
            try {
                const { data } = await executePost({ url: '/deployments/bulk', data: payload })
                return { deployments: data.deployments }
            } catch (error) {
                console.error(error)
                const serverMessage = isAxiosError(error) && typeof error.response?.data === 'string' ? error.response.data : undefined
                return { error: serverMessage ?? (error instanceof Error ? error.message : 'Could not start the bulk deploy') }
            }
        },
        [executePost, buildInstances]
    )

    return { createDeployment, savePreset, bulkDeploy, steps }
}
