import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useMemo } from 'react'
import { useAuthAxios } from '../../../../hooks'
import { Field, useField } from 'react-final-form'
import { mapStringToValueLabel } from './helpers'
import { ParameterFieldProps } from './parameter-field'

export const IntergrationParameterSelect: FC<ParameterFieldProps> = ({ displayName, parameterName }) => {
    const {
        meta: { initial: initialValue },
    } = useField(parameterName, {
        subscription: { initial: true },
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

    return (
        <Field
            required
            loading={loading}
            error={error}
            name={parameterName}
            label={displayName}
            component={SingleSelectFieldFF}
            filterable={options.length > 7}
            options={options}
            validate={hasValue}
        />
    )
}
