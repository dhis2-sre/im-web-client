import { InputFieldFF, hasValue } from '@dhis2/ui'
import { FC } from 'react'
import { Field } from 'react-final-form'
import { OPTIONAL_FIELDS } from '../constants.ts'
import { ParameterFieldProps } from './parameter-field.tsx'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName, type = 'text', sensitive, formMode = 'create' }) => {
    const shouldRequireValue = isRequired(parameterName) && !(sensitive && formMode === 'update')
    const validate = type === 'email' ? (shouldRequireValue ? validateEmailRequired : validateEmailOptional) : shouldRequireValue ? hasValue : undefined
    const placeholder = sensitive ? 'Leave blank to keep current value' : undefined
    return (
        <Field
            required={shouldRequireValue}
            name={`${stackId}.${parameterName}`}
            label={displayName}
            component={InputFieldFF}
            validate={validate}
            type={type}
            placeholder={placeholder}
        />
    )
}

const validateEmailRequired = (value: string) => {
    if (!value) {
        return 'Required'
    }
    return validateEmailFormat(value)
}

const validateEmailOptional = (value: string) => {
    if (!value) {
        return undefined
    }
    return validateEmailFormat(value)
}

const validateEmailFormat = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(value)) {
        return 'Invalid email address'
    }
    return undefined
}
