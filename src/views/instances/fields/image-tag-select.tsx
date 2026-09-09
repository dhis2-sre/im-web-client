import { FC, useEffect, useMemo, useState, useCallback } from 'react'
import { useField, useForm } from 'react-final-form'
import classes from '../../../components/searchable-single-select.module.css'
import { SearchableSingleSelect } from '../../../components/searchable-single-select.tsx'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Dhis2StackName, IMAGE_REPOSITORY, IMAGE_TAG } from '../parameters.ts'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'

interface ImageTagSelectProps {
    displayName: string
    stackId?: Dhis2StackName
    /* Which parameter the chosen tag is written to. Defaults to IMAGE_TAG; a stack whose components
     * carry their own images, as chap's worker does, names the one it means. */
    parameterName?: string
    organization?: string
    repository?: string
    registry?: string
}

const useImageTagField = (stackId: Dhis2StackName, parameterName: string) => {
    const fieldName = `${stackId}.${parameterName}`
    const { input } = useField<string>(fieldName)
    const { value, onChange } = input
    return { value, onChange }
}

const useIntegrationsOptions = (organization: string, repository: string, registry?: string) => {
    const payload = { url: '/integrations', method: 'POST', data: {} }
    const options = { manual: true, autoCatch: true }
    const [{ data }, refetch] = useAuthAxios(payload, options)

    useEffect(() => {
        if (repository) {
            refetch({
                data: {
                    key: IMAGE_TAG,
                    payload: {
                        organization,
                        repository,
                        ...(registry ? { registry } : {}),
                    },
                },
            })
        }
    }, [organization, repository, registry, refetch])

    const images = useMemo(() => data || [], [data])
    return images
}

const useResetImageTagFieldWhenSelectionNotAvailable = (availableOptions: string[], form, stackId: Dhis2StackName) => {
    const fieldName = `${stackId}.${IMAGE_TAG}`
    useEffect(() => {
        if (availableOptions.length) {
            const currentSelectedValue = form.getState().values[stackId]?.IMAGE_TAG

            if (currentSelectedValue && !availableOptions.includes(currentSelectedValue)) {
                form.change(fieldName, undefined)
                form.blur(fieldName)
            }
        }
    }, [availableOptions, form, fieldName, stackId])
}

const useRepositoryValue = (stackId: Dhis2StackName) => {
    const {
        input: { value: repository },
    } = useField<string>(`${stackId}.${IMAGE_REPOSITORY}`, { subscription: { value: true } })

    return repository
}

const useCheckImageExists = (repository, organization?: string, registry?: string) => {
    const payload = { url: `/integrations/image-exists/${repository}/{tag}`, method: 'GET' }
    const options = { manual: true, autoCatch: false }
    const [{ loading: imageLoading }, _checkImageExists] = useAuthAxios(payload, options)

    const checkImageExists = useCallback(
        async ({ tag, repository }) => {
            const params = new URLSearchParams()
            if (organization) {
                params.set('organization', organization)
            }
            if (registry) {
                params.set('registry', registry)
            }
            const query = params.size > 0 ? `?${params.toString()}` : ''
            const url = `/integrations/image-exists/${repository}/${tag}${query}`

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
        [_checkImageExists, organization, registry]
    )

    return { imageLoading, checkImageExists }
}

export const ImageTagSelect: FC<ImageTagSelectProps> = ({ displayName, stackId = 'dhis2-v2', parameterName = IMAGE_TAG, organization, repository: fixedRepository, registry }) => {
    const form = useForm()
    const { value: imageValue, onChange: onImageChange } = useImageTagField(stackId, parameterName)
    const dynamicRepository = useRepositoryValue(stackId)
    const repository = fixedRepository ?? dynamicRepository
    const resolvedOrganization = organization ?? 'dhis2'
    const { imageLoading, checkImageExists } = useCheckImageExists(repository, organization, registry)
    const [additionallyLoadedOptions, setAdditionallyLoadedOptions] = useState<string[]>([])
    const loadedOptions = useIntegrationsOptions(resolvedOrganization, repository, registry)

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
            setAdditionallyLoadedOptions((prev) => (prev.includes(imageValue) ? prev : [...prev, imageValue]))
        }
    }, [imageValue])

    useResetImageTagFieldWhenSelectionNotAvailable(options, form, stackId)

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
