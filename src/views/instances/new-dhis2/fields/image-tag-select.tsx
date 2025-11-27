import { FC, useEffect, useMemo, useState, useCallback } from 'react'
import { useField, useForm } from 'react-final-form'
import classes from '../../../../components/searchable-single-select.module.css'
import { SearchableSingleSelect } from '../../../../components/searchable-single-select.tsx'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { IMAGE_TAG } from '../constants.ts'
import { IMAGE_REPOSITORY_FIELD_NAME } from './image-repository-select.tsx'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'

const IMAGE_TAG_FIELD_NAME = `dhis2-core.${IMAGE_TAG}`

interface ImageTagSelectProps {
    displayName: string
}

const useImageTagField = () => {
    const { input } = useField<string>(IMAGE_TAG_FIELD_NAME)
    const { value, onChange } = input
    return { value, onChange }
}

const useIntegrationsOptions = (repository) => {
    const payload = { url: '/integrations', method: 'POST', data: {} }
    const options = { manual: true, autoCatch: true }
    const [{ data }, refetch] = useAuthAxios(payload, options)

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

    const images = useMemo(() => data || [], [data])
    return images
}

const useResetImageTagFieldWhenSelectionNotAvailable = (availableOptions: string[], form) => {
    useEffect(() => {
        if (availableOptions.length) {
            const currentSelectedValue = form.getState().values['dhis2-core']?.IMAGE_TAG

            if (currentSelectedValue && !availableOptions.some((option) => option === currentSelectedValue)) {
                form.change(IMAGE_TAG_FIELD_NAME, undefined)
                form.blur(IMAGE_TAG_FIELD_NAME)
            }
        }
    }, [availableOptions, form])
}

const useRepositoryValue = () => {
    const {
        input: { value: repository },
    } = useField<string>(IMAGE_REPOSITORY_FIELD_NAME, { subscription: { value: true } })

    return repository
}

const useCheckImageExists = (repository) => {
    const payload = { url: `/integrations/image-exists/${repository}/{tag}`, method: 'GET' }
    const options = { manual: true, autoCatch: false }
    const [{ loading: imageLoading }, _checkImageExists] = useAuthAxios(payload, options)

    const checkImageExists = useCallback(
        async ({ tag, repository }) => {
            const url = `/integrations/image-exists/${repository}/${tag}`

            try {
                const response = await _checkImageExists({ url })

                if (response.status === 200) {
                    return true
                } else {
                    if (process.env.NODE_ENV === 'development') {
                        console.error(new Error('Status code not 200'))
                    }

                    return false
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error(error)
                }

                return false
            }
        },
        [_checkImageExists]
    )

    return { imageLoading, checkImageExists }
}

export const ImageTagSelect: FC<ImageTagSelectProps> = ({ displayName }) => {
    const form = useForm()
    const { value: imageValue, onChange: onImageChange } = useImageTagField()
    const repository = useRepositoryValue()
    const { imageLoading, checkImageExists } = useCheckImageExists(repository)
    const [additionallyLoadedOptions, setAdditionallyLoadedOptions] = useState<string[]>([])
    const loadedOptions = useIntegrationsOptions(repository)

    const [options, setOptions] = useState<string[]>(loadedOptions)
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options)
    const [filtered, setFiltered] = useState(false)

    useEffect(() => {
        if (loadedOptions) {
            const unique = new Set<string>([...additionallyLoadedOptions, ...loadedOptions])
            setOptions(Array.from(unique))
        }
    }, [additionallyLoadedOptions, loadedOptions])

    useEffect(() => {
        if (imageValue) {
            setAdditionallyLoadedOptions((prev) => {
                if (prev.includes(imageValue)) {
                    return prev
                }
                return [...prev, imageValue]
            })
        }
    }, [imageValue])

    const filterOptions = useCallback(
        async ({ value: tag }) => {
            // Reset then filter value is being removed
            if (!tag) {
                setFiltered(false)
                return
            }

            // Set filtered options to what matches
            const filteredExistingOptions = options.filter((option) => option.startsWith(tag))
            if (filteredExistingOptions.length) {
                setFilteredOptions(filteredExistingOptions)
                setFiltered(true)
                return
            }

            const tagExists = await checkImageExists({ repository, tag })

            if (tagExists) {
                setAdditionallyLoadedOptions((prevAdditionallyLoadedOptions) =>
                    prevAdditionallyLoadedOptions.includes(tag) ? prevAdditionallyLoadedOptions : [...prevAdditionallyLoadedOptions, tag]
                )
                const nextOptions = [...options, tag]
                setOptions(nextOptions)
                setFilteredOptions([tag])
                setFiltered(true)
                return
            }

            setFilteredOptions([])
            setFiltered(true)
        },
        [options, checkImageExists, repository]
    )

    const displayOptions = useMemo(() => (filtered ? filteredOptions : options).map(mapStringToValueLabel), [filtered, filteredOptions, options])

    useResetImageTagFieldWhenSelectionNotAvailable(options, form)

    return (
        <div>
            <label className={classes.label}>{displayName} *</label>

            <SearchableSingleSelect
                onChange={(selected: { selected: string }) => onImageChange(selected.selected)}
                selected={imageValue}
                options={displayOptions}
                loading={imageLoading}
                placeholder={displayName}
                onFilterChange={filterOptions}
            />
        </div>
    )
}
