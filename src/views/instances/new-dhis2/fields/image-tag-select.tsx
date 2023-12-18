import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { FC, useEffect, useState } from 'react'
import { useAuthAxios } from '../../../../hooks'
import { Field, useField, useForm } from 'react-final-form'
import { IMAGE_TAG } from '../constants'
import { mapStringToValueLabel } from './helpers'
import { IMAGE_REPOSITORY_FIELD_NAME } from './image-repository-select'

const IMAGE_TAG_FIELD_NAME = `dhis2-core.${IMAGE_TAG}`

export const ImageTagSelect: FC<{ displayName: string }> = ({ displayName }) => {
    const form = useForm()
    const [options, setOptions] = useState([])

    const {
        meta: { initial: initialValue },
    } = useField(IMAGE_TAG_FIELD_NAME, {
        subscription: { initial: true },
    })
    const {
        input: { value: repository },
    } = useField(IMAGE_REPOSITORY_FIELD_NAME, {
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
                form.change(IMAGE_TAG_FIELD_NAME, undefined)
                /* Also blur so the field validation kicks in
                 * and user's attention is caught by the error
                 * message */
                form.blur(IMAGE_TAG_FIELD_NAME)
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
            name={IMAGE_TAG_FIELD_NAME}
            label={displayName}
            component={SingleSelectFieldFF}
            filterable={optionsWithFallback.length > 7}
            options={optionsWithFallback}
            validate={hasValue}
        />
    )
}
