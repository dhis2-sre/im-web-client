import type { AnyObject } from 'final-form'
import { COMPANION_LABELS } from '../../constants.ts'
import { buildEditPayload, type EditPayloadInput } from '../../hooks/build-edit-payload.ts'
import type { CreateDeploymentFromPresetRequest, Deployment, EditPresetRequest, StackParameterWithGroup } from '../../types/index.ts'
import type { BulkAskFor } from '../instances/dhis2-v2/bulk-deploy-modal.tsx'
import { PARAMETER_LABELS, PGADMIN_USERNAME } from '../instances/parameters.ts'

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

export const buildFromPresetRequest = (input: EditPayloadInput): CreateDeploymentFromPresetRequest => {
    const { values } = input
    const { instances } = buildEditPayload(input)
    return { name: values.name, group: values.groupName, description: values.description, ttl: values.ttl, ...(instances && { instances }) }
}

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

/* The required values a copy can't carry that the values don't hold yet, for the Create several dialog to ask for, labelled as the form labels
 * them. A companion's are prefixed with its name, as "pgAdmin Login password", unless the label already starts with it. */
export const askForUncopyable = ({
    values,
    activeStacks,
    uncopyable,
    stacks,
}: {
    values: AnyObject
    /* The main stack first, then the companions, as useStackDeploymentCreation's activeStacks lists them. */
    activeStacks: string[]
    uncopyable: Record<string, string[]>
    stacks: StackParameters[]
}): BulkAskFor[] =>
    activeStacks.flatMap((stackName, index) => {
        const stack = stacks.find((candidate) => candidate.name === stackName)
        const companionLabel = index === 0 ? '' : (COMPANION_LABELS[stackName] ?? stackName)
        return (uncopyable[stackName] ?? [])
            .filter((parameterName) => !values[stackName]?.[parameterName])
            .map((parameterName): BulkAskFor => {
                const label = PARAMETER_LABELS[parameterName] ?? stack?.parameters?.find((candidate) => candidate.parameterName === parameterName)?.displayName ?? parameterName
                return {
                    stackName,
                    parameterName,
                    displayName: label.startsWith(companionLabel) ? label : `${companionLabel} ${label}`,
                    type: parameterName === PGADMIN_USERNAME ? 'email' : parameterName.includes('PASSWORD') ? 'password' : 'text',
                }
            })
    })

/* What the dialog asked for, laid into each stack's values. */
export const withAsked = (values: AnyObject, asked: AnyObject): AnyObject =>
    Object.fromEntries(Object.entries({ ...values, ...asked }).map(([key, value]) => [key, asked[key] ? { ...values[key], ...asked[key] } : value]))
