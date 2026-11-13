import type { AnyObject } from 'final-form'
import { COMPANION_LABELS } from '../../constants.ts'
import { buildEditPayload, type EditPayloadInput } from '../../hooks/build-edit-payload.ts'
import type { CreateDeploymentFromPresetRequest, Deployment, EditPresetRequest, Group, StackParameterWithGroup, User } from '../../types/index.ts'
import type { BulkAskFor } from '../instances/dhis2-v2/bulk-deploy-modal.tsx'

/* Fields that belong to the new instance or the preset itself, so they are not a difference from the preset. */
export const PRESET_ONLY_FIELDS = ['name', 'ttl', 'groupName', 'description', 'presetChoice', 'presetName', 'saveAsPreset']

export const changedFromPreset = (dirtyFields: Record<string, boolean> | undefined): string[] =>
    Object.keys(dirtyFields ?? {}).filter((field) => dirtyFields![field] && !PRESET_ONLY_FIELDS.includes(field))

const SHOWN_CHANGES = 4

export const describeChanges = (fields: string[], displayNames: Record<string, string>): string => {
    const labels = fields.map((field) => displayNames[field] ?? field.slice(field.lastIndexOf('.') + 1))
    const shown = labels.slice(0, SHOWN_CHANGES).join(', ')
    const more = labels.length > SHOWN_CHANGES ? ` and ${labels.length - SHOWN_CHANGES} more` : ''
    return `${labels.length} ${labels.length === 1 ? 'setting differs' : 'settings differ'}: ${shown}${more}`
}

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

/* The required values a copy can't carry that the values don't hold yet, for the Create several dialog to ask for. A companion's are labelled with its name. */
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
        const prefix = index === 0 ? '' : `${COMPANION_LABELS[stackName] ?? stackName}: `
        return (uncopyable[stackName] ?? [])
            .filter((parameterName) => !values[stackName]?.[parameterName])
            .map((parameterName) => ({
                stackName,
                parameterName,
                displayName: `${prefix}${stack?.parameters?.find((candidate) => candidate.parameterName === parameterName)?.displayName ?? parameterName}`,
                type: parameterName.includes('PASSWORD') ? 'password' : 'text',
            }))
    })

/* What the dialog asked for, laid into each stack's values. */
export const withAsked = (values: AnyObject, asked: AnyObject): AnyObject =>
    Object.fromEntries(Object.entries({ ...values, ...asked }).map(([key, value]) => [key, asked[key] ? { ...values[key], ...asked[key] } : value]))

/* As the server decides it: an administrator, an admin of the preset's group, or its owner while still in that group. */
export const canWritePreset = (preset: Deployment, user: User | null, isAdministrator: boolean) => {
    const inGroup = (groups: Group[] = []) => groups.some((group) => group.name === preset.groupName)
    return isAdministrator || inGroup(user?.adminGroups) || (!!user && preset.userId === user.id && inGroup(user.groups))
}
