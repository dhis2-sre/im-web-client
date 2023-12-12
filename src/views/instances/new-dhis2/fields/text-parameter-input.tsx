import { InputFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { ParameterFieldProps } from './parameter-field'
import { OPTIONAL_FIELDS } from '../constants'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput = ({ name, parameterName }: ParameterFieldProps) => (
    <Field required={isRequired(name)} name={parameterName} label={name} component={InputFieldFF} validate={isRequired(parameterName) ? hasValue : undefined} />
)
