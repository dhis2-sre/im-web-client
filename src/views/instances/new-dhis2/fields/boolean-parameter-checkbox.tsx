import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { formatBool, parseBool } from './helpers'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field'

export const BooleanParameterCheckbox = ({ displayName, parameterName }: ParameterFieldProps) => (
    <Field type="checkbox" format={formatBool} parse={parseBool} required name={parameterName} label={displayName} component={CheckboxFieldFF} className={styles.parameterCheckbox} />
)
