import { InputFieldFF, hasValue } from '@dhis2/ui'
import { FC, useContext } from 'react'
import { Field } from 'react-final-form'
import { KeepValuePlaceholder } from './keep-value-placeholder.ts'
import { ParameterFieldProps } from './parameter-field.tsx'

export const TextParameterInput: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName, type = 'text', sensitive, required = false, formMode = 'create' }) => {
    const shouldRequireValue = required && !(sensitive && formMode === 'update')
    const validate = type === 'email' ? (shouldRequireValue ? validateEmailRequired : validateEmailOptional) : shouldRequireValue ? hasValue : undefined
    const keepValue = useContext(KeepValuePlaceholder)
    const placeholder = sensitive && formMode === 'update' ? keepValue : undefined
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
        return 'Enter an email address'
    }
    return validateEmailFormat(value)
}

const validateEmailOptional = (value: string) => {
    if (!value) {
        return undefined
    }
    return validateEmailFormat(value)
}

export const validateEmailFormat = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(value)) {
        return 'Enter a valid email address'
    }
    return undefined
}
