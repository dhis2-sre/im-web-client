import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useEffect, useMemo } from 'react'
import { Field, useField } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'
import { ParameterFieldProps } from './parameter-field.tsx'

export const IntergrationParameterSelect: FC<ParameterFieldProps> = ({ displayName, parameterName, stackId }) => {
    const fieldName = `${stackId}.${parameterName}`
    const {
        meta: { initial: initialValue },
        input,
    } = useField(fieldName, {
        subscription: { initial: true, value: true },
    })
    const [{ data, error, loading }] = useAuthAxios({
        url: '/integrations',
        method: 'POST',
        data: {
            key: parameterName,
        },
    })
    const options = useMemo(() => {
        if (!data) {
            return initialValue ? [{ value: initialValue, label: initialValue }] : []
        }

        return Array.isArray(data)
            ? data.map(mapStringToValueLabel)
            : Object.entries(data).map(([value, label]) => ({
                  value,
                  label,
              }))
    }, [data, initialValue])

    /* A parameter whose options are environment specific, the database being the one that matters,
     * has no default the stack could carry, so the field would sit empty and invalid until someone
     * opened it. The first option is as good a starting point as any and beats a blocked form.
     * Parameters that do carry a default already have a value here, so this leaves them alone. */
    const { value, onChange } = input
    useEffect(() => {
        if (!value && options.length > 0) {
            onChange(options[0].value)
        }
    }, [value, options, onChange])

    return (
        <Field
            required
            loading={loading}
            error={error}
            name={fieldName}
            label={displayName}
            component={SingleSelectFieldFF}
            filterable={options.length > 7}
            options={options}
            validate={hasValue}
        />
    )
}
