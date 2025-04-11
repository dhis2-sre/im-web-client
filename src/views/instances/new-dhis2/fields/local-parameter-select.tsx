import { hasValue, SingleSelectFieldFF } from '@dhis2/ui'
import { FC, useMemo } from 'react'
import { Field, useField } from 'react-final-form'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'
import { ParameterFieldProps } from './parameter-field.tsx'

export const LocalParameterSelect: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => {
    const fieldName = `${stackId}.${parameterName}`
    const {
        meta: { initial: initialValue },
    } = useField(fieldName, {
        subscription: { initial: true },
    })

    const options = useMemo(() => {
        if (!initialValue) {
            return []
        }
        return ['strict', 'lax', 'none'].map(mapStringToValueLabel)
    }, [initialValue])

    return (
        <Field
            required
            loading={false}
            error={null}
            name={fieldName}
            label={displayName}
            component={SingleSelectFieldFF}
            filterable={false}
            options={options}
            validate={hasValue}
        />
    )
}
