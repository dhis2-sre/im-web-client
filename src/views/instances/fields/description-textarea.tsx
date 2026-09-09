import { TextAreaFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import styles from './fields.module.css'

export const DescriptionTextarea = () => <Field className={styles.textarea} name="description" label="Description" component={TextAreaFieldFF} />
