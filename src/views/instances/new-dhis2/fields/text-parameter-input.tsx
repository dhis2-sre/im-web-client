import { InputFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { ParameterFieldProps } from './parameter-field'
import { OPTIONAL_FIELDS } from '../constants'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput = ({ displayName, parameterName }: ParameterFieldProps) => (
    <Field required={isRequired(displayName)} name={parameterName} label={displayName} component={InputFieldFF} validate={isRequired(parameterName) ? hasValue : undefined} />
)
