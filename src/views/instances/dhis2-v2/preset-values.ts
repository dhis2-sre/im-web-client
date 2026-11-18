import type { AnyObject } from 'final-form'
import type { Deployment } from '../../../types/index.ts'

/* A read replaces every sensitive value with a run of stars, which is not a value anyone can submit. */
export const isMaskedValue = (value: string) => /^[*•]+$/.test(value)

/* The form values a preset starts a new deployment from, laid over the form's initial values so
 * anything the preset left unset keeps its stack default. Sensitive values come back masked and are
 * dropped for the same reason, or with blankMasked left blank so the form asks for them. */
export const presetFormValues = (
    preset: Deployment,
    { mainStackName, initialValues, blankMasked = false }: { mainStackName: string; initialValues: AnyObject; blankMasked?: boolean }
): AnyObject => {
    const values: AnyObject = {
        ...initialValues,
        name: preset.name,
        description: preset.description ?? '',
        /* A ttl of 0 means the server default, which the Lifetime select has no option for. */
        ttl: preset.ttl || initialValues.ttl,
        groupName: preset.groupName ?? initialValues.groupName,
        public: preset.instances?.find((instance) => instance.stackName === mainStackName)?.public ?? false,
    }

    for (const instance of preset.instances ?? []) {
        if (!instance.stackName) {
            continue
        }
        const parameters = Object.entries(instance.parameters ?? {}).flatMap(([name, parameter]) => {
            const value = parameter.value ?? ''
            if (isMaskedValue(value)) {
                return blankMasked ? [[name, '']] : []
            }
            return value === '' ? [] : [[name, value]]
        })
        values[instance.stackName] = { ...initialValues[instance.stackName], ...Object.fromEntries(parameters) }
    }

    return values
}
