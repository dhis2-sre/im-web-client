import { InputFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { toTitleCase } from './helpers'
import { ParameterFieldProps } from './parameter-field'
import { OPTIONAL_FIELDS } from '../constants'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput = ({ name }: ParameterFieldProps) => (
    <Field required={isRequired(name)} name={name} label={toTitleCase(name)} component={InputFieldFF} validate={isRequired(name) ? hasValue : undefined} />
)
