import { TextAreaFieldFF } from '@dhis2/ui'
import { FC, useContext } from 'react'
import { Field } from 'react-final-form'
import styles from './fields.module.css'
import { ParameterFieldProps } from './parameter-field.tsx'
import { SensitiveFieldHintContext } from './sensitive-field-hint.ts'

export const TextareaParameter: FC<ParameterFieldProps> = ({ stackId, parameterName, displayName, sensitive, formMode = 'create' }) => {
    const fieldHint = useContext(SensitiveFieldHintContext)
    const hint = sensitive && formMode === 'update' ? fieldHint : undefined
    return (
        <Field
            className={styles.textarea}
            name={`${stackId}.${parameterName}`}
            label={displayName}
            component={TextAreaFieldFF}
            placeholder={hint?.placeholder}
            helpText={hint?.help}
        />
    )
}
