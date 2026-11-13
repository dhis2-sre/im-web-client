import { isAxiosError } from 'axios'
import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Deployment, SaveDeploymentRequest, SaveInstanceRequest, SavePresetRequest, StackCompanion } from '../types/index.ts'
import { buildEditPresetRequest, buildFromPresetRequest } from '../views/presets/preset-payloads.ts'
import { useAuthAxios } from './use-auth-axios.ts'

export type DeploymentStepStatus = 'pending' | 'running' | 'success' | 'error'
export type DeploymentStep = { stackName: string; status: DeploymentStepStatus }
export type BulkDeployment = { id: number; name: string }
/* A refused bulk deploy created nothing. Any other failure, a lost reply or a server error, may have come after the deployments were created. */
export type BulkDeployError = { message: string; refused: boolean }
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
 * helper fields are never sent. Saving a preset stores the same instances under /presets, and a
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

    const activeStacks = useCallback((values: AnyObject) => [stackName, ...includedCompanionsOf(values).map((companion) => companion.name)], [stackName, includedCompanionsOf])

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

    const errorMessage = (error: unknown, fallback: string) =>
        isAxiosError(error) && typeof error.response?.data === 'string' ? error.response.data : error instanceof Error ? error.message : fallback

    /* Deploying is accepted rather than performed, so this returns long before anything runs in the
     * cluster. The details page is where the deploy is watched. */
    const deployAndOpen = useCallback(
        async (id: number) => {
            await executePost({ url: `/deployments/${id}/deploy` })
            /* Long enough for the check marks to be seen before the details page replaces them. */
            await new Promise((resolve) => setTimeout(resolve, SETTLED_PAUSE_MS))
            navigate(`/instances/${id}/details`)
        },
        [executePost, navigate]
    )

    const createDeployment = useCallback(
        async (values: AnyObject) => {
            const instances = buildInstances(values)
            setSteps(instances.map((instance) => ({ stackName: instance.stackName ?? '', status: 'pending' })))

            try {
                const deploymentPayload: SaveDeploymentRequest = { name: values.name, group: values.groupName, description: values.description, ttl: values.ttl }
                const { data: deployment } = await executePost({ data: deploymentPayload })

                for (const instance of instances) {
                    setStatus([instance.stackName ?? ''], 'running')
                    await executePost({ url: `/deployments/${deployment.id}/instance`, data: instance })
                    setStatus([instance.stackName ?? ''], 'success')
                }

                await deployAndOpen(deployment.id)
                return undefined
            } catch (error) {
                console.error(error)
                setSteps((current) => current.map((step) => (step.status === 'running' ? { ...step, status: 'error' } : step)))
                return { [FORM_ERROR]: errorMessage(error, "Couldn't create the instance") }
            }
        },
        [executePost, buildInstances, setStatus, deployAndOpen]
    )

    const createFromPreset = useCallback(
        async (presetId: number, values: AnyObject, dirtyFields: Record<string, boolean>) => {
            const names = activeStacks(values)
            setSteps(names.map((name) => ({ stackName: name, status: 'pending' })))
            try {
                setStatus(names, 'running')
                const data = buildFromPresetRequest({ values, dirtyFields, includedParameters: new Set(getIncludedParameters(values)), stackName })
                const { data: deployment } = await executePost({ url: `/presets/${presetId}/deployments`, data })
                setStatus(names, 'success')
                await deployAndOpen(deployment.id)
                return undefined
            } catch (error) {
                console.error(error)
                setSteps((current) => current.map((step) => (step.status === 'running' ? { ...step, status: 'error' } : step)))
                return { [FORM_ERROR]: errorMessage(error, "Couldn't create the instance") }
            }
        },
        [executePost, activeStacks, setStatus, getIncludedParameters, stackName, deployAndOpen]
    )

    const savePreset = useCallback(
        async (values: AnyObject): Promise<{ id?: number; error?: string }> => {
            const data: SavePresetRequest = { name: values.name, group: values.groupName, description: values.description, ttl: values.ttl, instances: buildInstances(values) }
            try {
                const { data: preset } = await executePost({ url: '/presets', data })
                return { id: preset.id }
            } catch (error) {
                console.error(error)
                return { error: errorMessage(error, "Couldn't save the preset") }
            }
        },
        [executePost, buildInstances]
    )

    const updatePreset = useCallback(
        async (source: Deployment, values: AnyObject, dirtyFields: Record<string, boolean>): Promise<{ id?: number; error?: string }> => {
            const data = buildEditPresetRequest({ values, dirtyFields, includedParameters: new Set(getIncludedParameters(values)), stackName, source })
            try {
                await executePost({ url: `/presets/${source.id}`, method: 'PATCH', data })
                return { id: source.id }
            } catch (error) {
                console.error(error)
                return { error: errorMessage(error, "Couldn't save the preset") }
            }
        },
        [executePost, getIncludedParameters, stackName]
    )

    const bulkDeploy = useCallback(
        async (values: AnyObject, prefix: string, count: number): Promise<{ deployments?: BulkDeployment[]; error?: BulkDeployError }> => {
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
                const status = isAxiosError(error) ? error.response?.status : undefined
                return {
                    error: {
                        message: serverMessage ?? (error instanceof Error ? error.message : "Couldn't start the bulk deploy"),
                        refused: !!status && status >= 400 && status < 500,
                    },
                }
            }
        },
        [executePost, buildInstances]
    )

    return { createDeployment, createFromPreset, savePreset, updatePreset, bulkDeploy, activeStacks, steps }
}
