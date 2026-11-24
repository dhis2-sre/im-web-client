import type { AnyObject } from 'final-form'
import type { BulkDeployFromPresetRequest, CreateDeploymentFromPresetRequest, Deployment, EditPresetRequest, StackParameterWithGroup } from '../types/index.ts'
import { buildEditPayload, type EditPayloadInput } from './build-edit-payload.ts'

export const buildEditPresetRequest = ({ source, ...input }: EditPayloadInput & { source: Deployment }): EditPresetRequest => {
    const request: EditPresetRequest = buildEditPayload(input)
    if (input.values.name !== source.name) {
        request.name = input.values.name
    }
    if (input.values.groupName !== source.groupName) {
        request.group = input.values.groupName
    }
    return request
}

/* What deployments made from a preset change of it. The server copies the rest, sensitive values included. */
const fromPresetChanges = (input: EditPayloadInput) => {
    const { values } = input
    const { instances } = buildEditPayload(input)
    return { group: values.groupName, description: values.description, ttl: values.ttl, ...(instances && { instances }) }
}

export const buildFromPresetRequest = (input: EditPayloadInput): CreateDeploymentFromPresetRequest => ({ name: input.values.name, ...fromPresetChanges(input) })

export const buildBulkFromPresetRequest = (input: EditPayloadInput, prefix: string, count: number): BulkDeployFromPresetRequest => ({
    prefix,
    count,
    ...fromPresetChanges(input),
})

type StackParameters = { name?: string; parameters?: { parameterName?: string; displayName?: string; consumed?: boolean }[] }

/* The values an instance is created with: non-blank ones of parameters the stack declares, and of
 * those only the ones `include` lets through. Consumed parameters are left out: the server resolves
 * them itself and refuses them from the user, though it stores them and returns them on reads, so a
 * form filled from a stored preset or instance holds them. Form-only fields such as a password
 * confirmation are not declared and are left out too. */
export const creationParameters = (values: AnyObject, stack: StackParameters | undefined, include: (parameterName: string) => boolean = () => true) => {
    const sendable = new Set((stack?.parameters ?? []).filter((parameter) => !parameter.consumed).map((parameter) => parameter.parameterName))
    return Object.fromEntries(
        Object.entries(values)
            .filter(([parameterName, value]) => value && sendable.has(parameterName) && include(parameterName))
            .map(([parameterName, value]) => [parameterName, { value: String(value) }])
    )
}

/* A preset can't carry these, since the API masks sensitive values and there is nothing to fall back on. */
export const uncopyableParameters = (parameters: StackParameterWithGroup[]): string[] =>
    parameters.filter((parameter) => parameter.required && parameter.sensitive && parameter.defaultValue === undefined).map((parameter) => parameter.parameterName)

export const missingUncopyable = (values: AnyObject, uncopyable: Record<string, string[]>, activeStacks: string[]): Record<string, string> => {
    const errors: Record<string, string> = {}
    for (const stack of activeStacks) {
        for (const parameter of uncopyable[stack] ?? []) {
            if (!values[stack]?.[parameter]) {
                errors[`${stack}.${parameter}`] = 'Enter a value'
            }
        }
    }
    return errors
}
