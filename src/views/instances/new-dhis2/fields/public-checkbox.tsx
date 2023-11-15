import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { formatBool, parseBool } from './helpers'

export const PublicCheckbox = () => (
    <Field className={styles.field} type="checkbox" name="public" label="Make public" parse={parseBool} format={formatBool} component={CheckboxFieldFF} />
)
