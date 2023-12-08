import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useMemo } from 'react'
import { useAuthAxios } from '../../../../hooks'
import { Field, useField } from 'react-final-form'
import { mapStringToValueLabel } from './helpers'

type IntegrationParameterSelectProps = {
    name: string
    parameterName: string
}

export const IntegrationParameterSelect: FC<IntegrationParameterSelectProps> = ({ name, parameterName }) => {
    const {
        meta: { initial: initialValue },
    } = useField(name, {
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
            name={name}
            label={name}
            component={SingleSelectFieldFF}
            filterable={options.length > 7}
            options={options}
            validate={hasValue}
        />
    )
}
