import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useEffect, useState } from 'react'
import { useAuthAxios } from '../../../hooks'
import { Field, useField, useForm } from 'react-final-form'
import { IMAGE_TAG, IMAGE_REPOSITORY } from './constants'
import { mapStringToValueLabel, toTitleCase } from './helpers'

// Eerst is niks geladen, dus geen values en geen opties, lege select laten zien
// Dan laden de initialValues, maar de opties nog niet, dan een nep optie lijst laten zien met de initial value
// Dan de opties (data), dus dan is het mogelijk de initial value te laten zien en volledige lijst
// Als repository veranderd wordt een nieuwe optie lijst opgehaald. Zodra deze binnenkomt ontstaat er een mismatch

export const ImageTagSelect: FC = () => {
    const form = useForm()
    const [options, setOptions] = useState([])
    const {
        meta: { initial: initialValue },
    } = useField(IMAGE_TAG, {
        subscription: { initial: true },
    })
    const {
        input: { value: repository },
    } = useField(IMAGE_REPOSITORY, {
        subscription: { value: true },
    })
    const [{ data, error, loading }, refetch] = useAuthAxios(
        {
            url: '/integrations',
            method: 'POST',
            data: {},
        },
        { manual: true, autoCatch: true }
    )
    useEffect(() => {
        if (data) {
            /* If the component has data already and has
             * gone back into a loading state then this means
             * a new list is being fetched due to a repository
             * change. Since the currently selected image tag
             * won't be available under the new repository,
             * the selection now needs to be cleared. */
            if (loading) {
                form.change(IMAGE_TAG, undefined)
            }
            setOptions(data.map(mapStringToValueLabel))
        }
    }, [data, loading, form])

    useEffect(() => {
        if (repository) {
            refetch({
                data: {
                    key: IMAGE_TAG,
                    payload: {
                        organization: 'dhis2',
                        repository,
                    },
                },
            })
        }
    }, [repository, refetch])

    const optionsWithFallback = options.length === 0 && initialValue ? [{ value: initialValue, label: initialValue }] : options

    return (
        <Field
            required
            loading={loading}
            error={error}
            name={IMAGE_TAG}
            label={toTitleCase(IMAGE_TAG)}
            component={SingleSelectFieldFF}
            options={optionsWithFallback}
            validate={hasValue}
        />
    )
}
