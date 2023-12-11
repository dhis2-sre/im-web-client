import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { formatBool, parseBool } from './helpers'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field'

export const BooleanParameterCheckbox = ({ name, parameterName }: ParameterFieldProps) => (
    <Field type="checkbox" format={formatBool} parse={parseBool} required name={parameterName} label={name} component={CheckboxFieldFF} className={styles.parameterCheckbox} />
)
