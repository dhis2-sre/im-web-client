import type { AnyObject } from 'final-form'
import { EditDeploymentRequest, EditInstanceRequest } from '../types/index.ts'

/* The whole contract between the edit form and PATCH /deployments/:id.
 *
 * A read answers with *** in place of every sensitive value, so a form that posted back everything it
 * rendered would write that into the instance. The payload is therefore built from the fields the
 * user actually touched: react-final-form knows which those are, and everything else is left out and
 * kept as it stands. */
export type EditPayloadInput = {
    values: AnyObject
    /* Which fields the user touched. Everything else is left out and keeps the value it has. */
    dirtyFields: Record<string, boolean>
    /* The parameters of the edited stack whose section is currently visible. */
    includedParameters: Set<string>
    stackName: string
}

export const buildEditPayload = ({ values, dirtyFields, includedParameters, stackName }: EditPayloadInput): EditDeploymentRequest => {
    const payload: EditDeploymentRequest = {}

    if (dirtyFields.description) {
        payload.description = values.description ?? ''
    }
    if (dirtyFields.ttl) {
        payload.ttl = values.ttl
    }

    const instances: Record<string, EditInstanceRequest> = {}
    const instanceFor = (name: string) => (instances[name] ??= {})

    if (dirtyFields.public) {
        instanceFor(stackName).public = Boolean(values.public)
    }

    for (const field of Object.keys(dirtyFields)) {
        if (!dirtyFields[field]) {
            continue
        }
        const separator = field.indexOf('.')
        if (separator === -1) {
            continue
        }

        const fieldStack = field.slice(0, separator)
        const parameterName = field.slice(separator + 1)
        /* A parameter of the stack being edited counts only while the section holding it is visible,
         * so a value typed into a section a later choice hid never reaches the backend. A companion's
         * parameters are governed by the condition that decides whether the companion is there at all. */
        if (fieldStack === stackName && !includedParameters.has(parameterName)) {
            continue
        }
        if (parameterName.endsWith('CONFIRM_PASSWORD')) {
            continue
        }

        const value = (values[fieldStack] as AnyObject | undefined)?.[parameterName]
        /* A sensitive field is rendered empty and blank means keep what is stored, so an emptied
         * field is not a request to store an empty value. */
        if (value === undefined || value === '') {
            continue
        }

        const instance = instanceFor(fieldStack)
        instance.parameters = { ...instance.parameters, [parameterName]: { value: String(value) } }
    }

    if (Object.keys(instances).length > 0) {
        payload.instances = instances
    }

    return payload
}
