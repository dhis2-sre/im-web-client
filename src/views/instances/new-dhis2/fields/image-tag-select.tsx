import { FC, useEffect, useState } from 'react'
import { useField, useForm } from 'react-final-form'
import { SearchableSingleSelect } from '../../../../components/searchable-single-select.tsx'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { IMAGE_TAG } from '../constants.ts'
import { IMAGE_REPOSITORY_FIELD_NAME } from './image-repository-select.tsx'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'

const IMAGE_TAG_FIELD_NAME = `['dhis2-core'].${IMAGE_TAG}`

export const ImageTagSelect: FC<{ displayName: string }> = ({ displayName }) => {
    const form = useForm()
    const [options, setOptions] = useState<{ value: string; label: string }[]>([])

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

    // Effect to handle setting options based on the data fetched
    useEffect(() => {
        if (data) {
            if (loading) {
                form.change(IMAGE_TAG_FIELD_NAME, undefined)
                form.blur(IMAGE_TAG_FIELD_NAME)
            }
            setOptions(data.map(mapStringToValueLabel))
        }
    }, [data, loading, form])

    // Effect to trigger refetching options when the repository value changes
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

    const handleFilterChange = ({ value }: { value: string }) => {
        // Here, you would trigger the filtering of options by the search query
        // You can debounce this input if necessary (it's already debounced by SearchableSingleSelect)
        refetch({
            data: {
                key: IMAGE_TAG,
                payload: {
                    organization: 'dhis2',
                    repository,
                    filter: value,
                },
            },
        })
    }

    // Handle option selection
    const handleChange = (selected: { selected: string }) => {
        form.change(IMAGE_TAG_FIELD_NAME, selected.selected)
    }

    // Provide fallback if no options are available but there’s an initial value
    const optionsWithFallback = options.length === 0 && initialValue ? [{ value: initialValue, label: initialValue }] : options

    return (
        <SearchableSingleSelect
            onChange={handleChange}
            onFilterChange={handleFilterChange}
            onRetryClick={() => refetch()}
            options={optionsWithFallback}
            loading={loading}
            error={error ? error.message : undefined}
            placeholder={displayName}
            selected={form.getState().values['dhis2-core']?.IMAGE_TAG || undefined}
            showEndLoader={false}
        />
    )
}
