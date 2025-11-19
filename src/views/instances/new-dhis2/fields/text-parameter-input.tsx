import { InputFieldFF, hasValue } from '@dhis2/ui'
import { FC } from 'react'
import { Field } from 'react-final-form'
import { OPTIONAL_FIELDS } from '../constants.ts'
import { ParameterFieldProps } from './parameter-field.tsx'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName, type = 'text', sensitive }) => {
    const validate = type === 'email' ? validateEmail : isRequired(parameterName) ? hasValue : undefined
    const placeholder = sensitive ? 'Leave blank to keep current value' : undefined
    return (
        <Field
            required={isRequired(parameterName)}
            name={`${stackId}.${parameterName}`}
            label={displayName}
            component={InputFieldFF}
            validate={validate}
            type={type}
            placeholder={placeholder}
        />
    )
}

const validateEmail = (value: string) => {
    if (!value) {
        return 'Required'
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(value)) {
        return 'Invalid email address'
    }
    return undefined
}
