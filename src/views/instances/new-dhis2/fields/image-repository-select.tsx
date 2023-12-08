import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useMemo } from 'react'
import { useAuthAxios } from '../../../../hooks'
import { Field, useField } from 'react-final-form'
import { IMAGE_REPOSITORY } from '../constants'
import { mapStringToValueLabel } from './helpers'

export type ImageRepositorySelectProps = {
    name: string
}

export const ImageRepositorySelect: FC<ImageRepositorySelectProps> = ({ name }) => {
    const {
        meta: { initial: initialValue },
    } = useField(name, {
        subscription: { initial: true },
    })
    const [{ data, error, loading }] = useAuthAxios({
        url: '/integrations',
        method: 'POST',
        data: {
            key: IMAGE_REPOSITORY,
            payload: {
                organization: 'dhis2',
            },
        },
    })
    const options = useMemo(() => {
        if (!data) {
            return initialValue ? [{ value: initialValue, label: initialValue }] : []
        }

        return data.filter((value: string) => value.startsWith('core')).map(mapStringToValueLabel)
    }, [data, initialValue])

    return (
        <Field
            filterable={options.length > 7}
            required
            loading={loading}
            error={error}
            name={name}
            label={name}
            component={SingleSelectFieldFF}
            options={options}
            validate={hasValue}
        />
    )
}
