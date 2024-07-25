import { CheckboxFieldFF } from '@dhis2/ui'
import { FC } from 'react'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field.tsx'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseBool = (bool: any): string => (typeof bool === 'boolean' && bool ? 'true' : 'false')
export const formatBool = (str: string): boolean => str === 'true'

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
