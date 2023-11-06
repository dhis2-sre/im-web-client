import { AnyObject } from 'react-final-form'
import { DeployInstanceRequest } from '../../../types'
import { OPTIONAL_FIELDS } from './constants'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const toTitleCase = (str: string): string =>
    str
        .toLowerCase()
        .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())

export const mapStringToValueLabel = (str: string): { value: string; label: string } => ({ value: str, label: str })

export const convertValuesToPayload = (values: AnyObject) =>
    Object.entries(values).reduce<DeployInstanceRequest>(
        (payload, [name, value]) => {
            if (payload.hasOwnProperty(name)) {
                payload[name] = value
            } else {
                payload.parameters.push({ name, value })
            }
            return payload
        },
        {
            description: undefined,
            groupName: undefined,
            name: undefined,
            public: undefined,
            stackName: undefined,
            ttl: undefined,
            parameters: [],
        }
    )

export const converter = {
    bool: {
        parse: (str) => str === 'true',
        format: (bool) => (typeof bool === 'boolean' ? bool.toString() : false),
    },
    boolString: {
        parse: (bool) => (typeof bool === 'boolean' && bool ? 'true' : 'false'),
        format: (str) => (str === 'true' ? str : ''),
    },
    integer: {
        parse: (str) => parseInt(str),
        format: (integer) => integer.toString(),
    },
}
