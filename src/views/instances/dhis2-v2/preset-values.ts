import type { AnyObject } from 'final-form'
import type { Deployment } from '../../../types/index.ts'

const isMaskedValue = (value: string) => /^[*•]+$/.test(value)

/* The form values a preset starts a new deployment from, laid over the form's initial values so
 * anything the preset left unset keeps its stack default. Sensitive values come back masked and are
 * dropped for the same reason. */
export const presetFormValues = (preset: Deployment, mainStackName: string, initialValues: AnyObject): AnyObject => {
    const values: AnyObject = {
        ...initialValues,
        name: preset.name,
        description: preset.description ?? '',
        ttl: preset.ttl ?? initialValues.ttl,
        groupName: preset.groupName ?? initialValues.groupName,
        public: preset.instances?.find((instance) => instance.stackName === mainStackName)?.public ?? false,
    }

    for (const instance of preset.instances ?? []) {
        if (!instance.stackName) {
            continue
        }
        const parameters = Object.entries(instance.parameters ?? {})
            .map(([name, parameter]) => [name, parameter.value ?? ''] as const)
            .filter(([, value]) => value !== '' && !isMaskedValue(value))
        values[instance.stackName] = { ...(initialValues[instance.stackName] ?? {}), ...Object.fromEntries(parameters) }
    }

    return values
}
