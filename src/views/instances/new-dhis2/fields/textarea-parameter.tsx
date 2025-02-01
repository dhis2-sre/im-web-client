import { TextAreaFieldFF } from '@dhis2/ui'
import { FC } from 'react'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field.tsx'

export const TextareaParameter: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName }) => {
    return <Field className={styles.textarea} name={`${stackId}.${parameterName}`} label={displayName} component={TextAreaFieldFF} />
}
