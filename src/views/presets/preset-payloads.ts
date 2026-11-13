import type { AnyObject } from 'final-form'
import { buildEditPayload, type EditPayloadInput } from '../../hooks/build-edit-payload.ts'
import type { CreateDeploymentFromPresetRequest, Deployment, EditPresetRequest, StackParameterWithGroup } from '../../types/index.ts'

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
