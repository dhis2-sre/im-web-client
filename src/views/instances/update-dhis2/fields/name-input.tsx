import { InputFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from '../styles.module.css'

export const NameInput = () => (
    <Field helpText="Shown in the instance URL" className={styles.field} required name="name" label="Name" component={InputFieldFF} disabled />
)
