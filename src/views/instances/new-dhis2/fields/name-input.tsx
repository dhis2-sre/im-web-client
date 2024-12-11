import { InputFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { validateDnsLabel } from './validate-dns-label.ts'

export const NameInput = () => (
    <Field helpText="Shown in the instance URL" className={styles.field} required name="name" label="Name" component={InputFieldFF} validate={validateDnsLabel} />
)
