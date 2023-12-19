import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from './fields.module.css'

export const PublicCheckbox = () => <Field className={styles.field} type="checkbox" name="public" label="Make public" component={CheckboxFieldFF} />
