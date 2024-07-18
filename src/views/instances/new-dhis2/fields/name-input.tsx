import { Field } from 'react-final-form'
import { InputFieldFF } from '@dhis2/ui'
import styles from './fields.module.css'
import { validateDnsLabel } from './validate-dns-label'

export const NameInput = () => (
    <Field helpText="Shown in the instance URL" className={styles.field} required name="name" label="Name" component={InputFieldFF} validate={validateDnsLabel} />
)
