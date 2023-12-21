import { InputFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { ParameterFieldProps } from './parameter-field'
import { OPTIONAL_FIELDS } from '../constants'
import { FC } from 'react'

export const isRequired = (name: string) => !OPTIONAL_FIELDS.has(name)

export const TextParameterInput: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => (
    <Field
        required={isRequired(parameterName)}
        name={`${stackId}.${parameterName}`}
        label={displayName}
        component={InputFieldFF}
        validate={isRequired(parameterName) ? hasValue : undefined}
    />
)
