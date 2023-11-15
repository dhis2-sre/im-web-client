import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from './fields.module.css'

const parse = (str) => str === 'true'
const format = (bool) => (typeof bool === 'boolean' ? bool.toString() : false)

export const PublicCheckbox = () => <Field className={styles.field} type="checkbox" name="public" label="Make public" parse={parse} format={format} component={CheckboxFieldFF} />
