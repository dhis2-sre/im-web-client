import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { formatBool, parseBool } from './helpers'
import styles from './fields.module.css'

export type BooleanParameterCheckboxProps = {
    name: string
}

export const BooleanParameterCheckbox = ({ name }: BooleanParameterCheckboxProps) => (
    <Field type="checkbox" format={formatBool} parse={parseBool} required name={name} label={name} component={CheckboxFieldFF} className={styles.parameterCheckbox} />
)
