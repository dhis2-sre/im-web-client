import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field'
import { FC } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any,react-refresh/only-export-components */
export const parseBool = (bool: any): string => (typeof bool === 'boolean' && bool ? 'true' : 'false')
export const formatBool = (str: string): boolean => str === 'true'
/* eslint-enable @typescript-eslint/no-explicit-any,react-refresh/only-export-components */

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
