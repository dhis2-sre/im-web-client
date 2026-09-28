import { FC, useEffect, useMemo, useRef, useState, useCallback } from 'react'
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
    const options = { manual: true, autoCatch: true, useCache: false }
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

/* A tag belongs to the repository it was picked from, so changing the repository drops it rather
 * than carrying it over to a repository that may not publish it at all. The previous attempt at this
 * compared the selection against the offered options, which could never fire: the selected tag is
 * added to those options so it stays visible, so it was always found among them. Comparing against
 * the repository instead also leaves a tag that has aged out of its own repository's listing alone,
 * which the options comparison would have cleared on opening the edit form. */
const useResetImageTagWhenRepositoryChanges = ({ repository, form, fieldName, onReset }: { repository: string; form; fieldName: string; onReset: () => void }) => {
    const previousRepository = useRef<string | undefined>(undefined)

    useEffect(() => {
        if (!repository) {
            return
        }
        if (previousRepository.current === undefined || previousRepository.current === repository) {
            previousRepository.current = repository
            return
        }

        previousRepository.current = repository
        onReset()
        form.change(fieldName, undefined)
        form.blur(fieldName)
    }, [repository, form, fieldName, onReset])
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
    /* Tags typed in and confirmed against the registry, which the listing did not return. They are
     * verified against one repository, so they go when the repository does. */
    const [verifiedOptions, setVerifiedOptions] = useState<string[]>([])
    const loadedOptions = useIntegrationsOptions(resolvedOrganization, repository, registry)

    const [filteredOptions, setFilteredOptions] = useState<string[]>([])
    const [filtered, setFiltered] = useState(false)

    const options = useMemo(() => Array.from(new Set<string>([...loadedOptions, ...verifiedOptions])), [loadedOptions, verifiedOptions])

    /* Everything the select holds was derived from one repository, the filter a search left behind
     * included, so all of it goes when the repository changes. */
    const clearOptionsOfPreviousRepository = useCallback(() => {
        setVerifiedOptions([])
        setFilteredOptions([])
        setFiltered(false)
    }, [])
    useResetImageTagWhenRepositoryChanges({ repository, form, fieldName: `${stackId}.${parameterName}`, onReset: clearOptionsOfPreviousRepository })

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
                setVerifiedOptions((previous) => (previous.includes(tag) ? previous : [...previous, tag]))
                setFilteredOptions([tag])
                setFiltered(true)
                return
            }

            setFilteredOptions([])
            setFiltered(true)
        },
        [options, checkImageExists, repository]
    )

    /* An instance can be pinned to a tag its repository has since stopped listing, and a select that
     * drops it renders as though nothing were chosen. */
    const displayOptions = useMemo(() => {
        const all = imageValue && !options.includes(imageValue) ? [...options, imageValue] : options
        return (filtered ? filteredOptions : all).map(mapStringToValueLabel)
    }, [filtered, filteredOptions, options, imageValue])

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
