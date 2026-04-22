import { FC, useEffect, useMemo, useState, useCallback } from 'react'
import { useField, useForm } from 'react-final-form'
import classes from '../../../../components/searchable-single-select.module.css'
import { SearchableSingleSelect, Option } from '../../../../components/searchable-single-select.tsx'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { IMAGE_TAG } from '../constants.ts'
import { Dhis2StackName } from '../parameter-fieldset.tsx'
import { IMAGE_REPOSITORY_FIELD_NAME } from './image-repository-select.tsx'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'

interface ImageTagSelectProps {
    displayName: string
    stackId?: Dhis2StackName
    organization?: string
    repository?: string
    registry?: string
}

const useImageTagField = (stackId: Dhis2StackName) => {
    const fieldName = `['${stackId}'].${IMAGE_TAG}`
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

const useResetImageTagFieldWhenSelectionNotAvailable = (loadedOptions, form, stackId: Dhis2StackName) => {
    const fieldName = `['${stackId}'].${IMAGE_TAG}`
    useEffect(() => {
        if (loadedOptions.length) {
            const currentSelectedValue = form.getState().values[stackId]?.IMAGE_TAG

            if (currentSelectedValue && !loadedOptions.some((option) => option.value === currentSelectedValue)) {
                form.change(fieldName, undefined)
                form.blur(fieldName)
            }
        }
    }, [loadedOptions, form, fieldName, stackId])
}

const useRepositoryValue = () => {
    const {
        input: { value: repository },
    } = useField<string>(IMAGE_REPOSITORY_FIELD_NAME, { subscription: { value: true } })

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

export const ImageTagSelect: FC<ImageTagSelectProps> = ({ displayName, stackId = 'dhis2-core', organization, repository: fixedRepository, registry }) => {
    const form = useForm()
    const { value: imageValue, onChange: onImageChange } = useImageTagField(stackId)
    const dynamicRepository = useRepositoryValue()
    const repository = fixedRepository ?? dynamicRepository
    const resolvedOrganization = organization ?? 'dhis2'
    const { imageLoading, checkImageExists } = useCheckImageExists(repository, organization, registry)
    const [additionallyLoadedOptions, setAdditionallyLoadedOptions] = useState<Option[]>([])
    const loadedOptions = useIntegrationsOptions(resolvedOrganization, repository, registry)

    useResetImageTagFieldWhenSelectionNotAvailable(loadedOptions, form, stackId)

    const [options, setOptions] = useState(loadedOptions)
    const [filteredOptions, setFilteredOptions] = useState(options)
    const [filtered, setFiltered] = useState(false)

    useEffect(() => {
        if (loadedOptions) {
            const unique = new Set([...additionallyLoadedOptions, ...loadedOptions])
            setOptions(Array.from(unique))
        }
    }, [additionallyLoadedOptions, loadedOptions])

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
                setAdditionallyLoadedOptions((prevAdditionallyLoadedOptions) => [...prevAdditionallyLoadedOptions, tag])
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
