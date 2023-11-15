import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { toTitleCase } from './helpers'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field'

const parse = (bool) => (typeof bool === 'boolean' && bool ? 'true' : 'false')
const format = (str) => (str === 'true' ? str : '')

export const BooleanParameterCheckbox = ({ name }: ParameterFieldProps) => (
    <Field type="checkbox" format={format} parse={parse} required name={name} label={toTitleCase(name)} component={CheckboxFieldFF} className={styles.parameterCheckbox} />
)
