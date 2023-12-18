import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { formatBool, parseBool } from './helpers'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field'
import { FC } from 'react'

export const BooleanParameterCheckbox: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => (
    <Field
        type="checkbox"
        format={formatBool}
        parse={parseBool}
        required
        name={`${stackId}.${parameterName}`}
        label={displayName}
        component={CheckboxFieldFF}
        className={styles.parameterCheckbox}
    />
)
