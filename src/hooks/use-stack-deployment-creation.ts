import { isAxiosError } from 'axios'
import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Deployment, SaveDeploymentRequest, SaveInstanceRequest, SavePresetRequest, StackCompanion } from '../types/index.ts'
import { errorMessage } from '../utils/error-message.ts'
import { buildBulkFromPresetRequest, buildEditPresetRequest, buildFromPresetRequest, creationParameters } from '../views/presets/preset-payloads.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useStacks } from './use-stacks.ts'

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
 * declared without one is always included, the same reading the form renders by. Only parameters
 * the stack declares are sent, never its consumed ones (see creationParameters). Saving a preset stores the same instances under /presets, and a
 * bulk deploy sends the same instances to be created and deployed under many names, or from a preset only what changed of it. */
export const useStackDeploymentCreation = (stackName: string, getIncludedParameters: (values: AnyObject) => string[], companions: StackCompanion[] = []) => {
    const navigate = useNavigate()
    const { stacks } = useStacks()
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
            const stackOf = (name: string) => stacks.find((stack) => stack.name === name)
            const parameters = creationParameters(values[stackName] ?? {}, stackOf(stackName), (parameterName) => included.has(parameterName))
            const companionInstances = includedCompanionsOf(values).map(
                (companion): SaveInstanceRequest => ({ stackName: companion.name, parameters: creationParameters(values[companion.name] ?? {}, stackOf(companion.name)) })
            )
            return [{ stackName, parameters, public: values.public }, ...companionInstances]
        },
        [stackName, getIncludedParameters, includedCompanionsOf, stacks]
    )

    const setStatus = useCallback((names: string[], status: DeploymentStepStatus) => {
        setSteps((current) => current.map((step) => (names.includes(step.stackName) ? { ...step, status } : step)))
    }, [])

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
                return { [FORM_ERROR]: errorMessage(error) }
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
                return { [FORM_ERROR]: errorMessage(error) }
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
                return { error: errorMessage(error) }
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
                return { error: errorMessage(error) }
            }
        },
        [executePost, getIncludedParameters, stackName]
    )

    /* From a preset, the server copies the preset's sensitive values, which a read only ever shows masked, so only what changed is sent. */
    const bulkDeploy = useCallback(
        async (
            values: AnyObject,
            { prefix, count, fromPreset }: { prefix: string; count: number; fromPreset?: { id: number; dirtyFields: Record<string, boolean> } }
        ): Promise<{ deployments?: BulkDeployment[]; error?: BulkDeployError }> => {
            const request = fromPreset
                ? {
                      url: `/presets/${fromPreset.id}/deployments/bulk`,
                      data: buildBulkFromPresetRequest(
                          { values, dirtyFields: fromPreset.dirtyFields, includedParameters: new Set(getIncludedParameters(values)), stackName },
                          prefix,
                          count
                      ),
                  }
                : {
                      url: '/deployments/bulk',
                      data: {
                          prefix,
                          count,
                          group: values.groupName,
                          description: values.description,
                          ttl: values.ttl,
                          instances: buildInstances(values),
                      } satisfies BulkDeployRequest,
                  }
            try {
                const { data } = await executePost(request)
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
        [executePost, buildInstances, getIncludedParameters, stackName]
    )

    return { createDeployment, createFromPreset, savePreset, updatePreset, bulkDeploy, activeStacks, steps }
}
