import { TextAreaFieldFF } from '@dhis2/ui'
import { FC, useContext } from 'react'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { KeepValuePlaceholder } from './keep-value-placeholder.ts'
import { ParameterFieldProps } from './parameter-field.tsx'

export const TextareaParameter: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName, sensitive, formMode = 'create' }) => {
    const keepValue = useContext(KeepValuePlaceholder)
    const placeholder = sensitive && formMode === 'update' ? keepValue : undefined
    return <Field className={styles.textarea} name={`${stackId}.${parameterName}`} label={displayName} component={TextAreaFieldFF} placeholder={placeholder} />
}
