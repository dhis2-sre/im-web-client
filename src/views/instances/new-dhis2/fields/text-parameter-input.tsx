import { InputFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { ParameterFieldProps } from './parameter-field'
import { OPTIONAL_FIELDS } from '../constants'
import { FC } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName, type = 'text' }) => {
    const validate = type === 'email' ? validateEmail : isRequired(parameterName) ? hasValue : undefined
    return <Field required={isRequired(parameterName)} name={`${stackId}.${parameterName}`} label={displayName} component={InputFieldFF} validate={validate} type={type} />
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
