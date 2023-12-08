import { InputFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { ParameterFieldProps } from './parameter-field'
import { OPTIONAL_FIELDS } from '../constants'

export type TextParameterInputProps = {
    name: string
}

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput = ({ name }: TextParameterInputProps) => (
    <Field required={isRequired(name)} name={name} label={name} component={InputFieldFF} validate={isRequired(name) ? hasValue : undefined} />
)
