import { hasValue } from '@dhis2/ui'
import { FC, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useField, useForm } from 'react-final-form'
import classes from '../../../components/searchable-single-select.module.css'
import { SearchableSingleSelect } from '../../../components/searchable-single-select.tsx'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Dhis2StackName, IMAGE_REPOSITORY, IMAGE_TAG } from '../parameters.ts'
import fieldClasses from './fields.module.css'
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

/* The tag is required, and required here rather than only in the markup: buildEditPayload and
 * useStackDeploymentCreation both drop a parameter whose value is empty, so a submit with no tag
 * does not clear it, it keeps whatever the instance already had or falls back to the stack's
 * default. Either way the user gets a tag they did not choose, for a repository that may not
 * publish it. */
const useImageTagField = (stackId: Dhis2StackName, parameterName: string) => {
    const fieldName = `${stackId}.${parameterName}`
    const { input, meta } = useField<string>(fieldName, { validate: hasValue })
    const { value, onChange, onBlur } = input
    return { value, onChange, onBlur, invalid: meta.touched && meta.invalid, error: meta.touched ? (meta.error as string | undefined) : undefined }
}

const useIntegrationsOptions = (organization: string, repository: string, registry?: string) => {
    const payload = { url: '/integrations', method: 'POST', data: {} }
    const options = { manual: true, autoCatch: false, useCache: false }
    const [{ data }, refetch] = useAuthAxios(payload, options)
    /* Which repository the response in hand describes. axios-hooks keeps the previous response while
     * the next request is in flight, and the listing is a proxied call to Docker Hub or GHCR, so
     * without this the tags of the repository just left are offered as though they were the new
     * one's for as long as that takes. A request that fails leaves this behind, which is right: an
     * empty list says nothing rather than something untrue. */
    const [loadedFor, setLoadedFor] = useState<string | undefined>(undefined)
    const requested = useRef<string | undefined>(undefined)

    useEffect(() => {
        if (!repository) {
            return
        }

        requested.current = repository
        void refetch({
            data: {
                key: IMAGE_TAG,
                payload: {
                    organization,
                    repository,
                    ...(registry ? { registry } : {}),
                },
            },
        }).then(
            () => {
                if (requested.current === repository) {
                    setLoadedFor(repository)
                }
            },
            (error) => console.error(error)
        )
    }, [organization, repository, registry, refetch])

    const current = loadedFor === repository
    const images = useMemo(() => (current ? data || [] : []), [data, current])
    return { images, loading: !!repository && !current }
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
            const url = `/integrations/image-exists/${repository}/${encodeURIComponent(tag)}${query}`

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
    const { value: imageValue, onChange: onImageChange, onBlur: onImageBlur, invalid, error } = useImageTagField(stackId, parameterName)
    const dynamicRepository = useRepositoryValue(stackId)
    const repository = fixedRepository ?? dynamicRepository
    const resolvedOrganization = organization ?? 'dhis2'
    const { imageLoading, checkImageExists } = useCheckImageExists(repository, organization, registry)
    /* Tags typed in and confirmed against the registry, which the listing did not return. They are
     * verified against one repository, so they go when the repository does. */
    const [verifiedOptions, setVerifiedOptions] = useState<string[]>([])
    const { images: loadedOptions, loading: tagsLoading } = useIntegrationsOptions(resolvedOrganization, repository, registry)

    const [filteredOptions, setFilteredOptions] = useState<string[]>([])
    const [filtered, setFiltered] = useState(false)

    /* The selected tag is one of the options even when the repository's listing has stopped
     * returning it, or an instance pinned to an older tag reads as though nothing were chosen, and
     * filtering for it turns up nothing. Carrying it here was what made the previous reset unable to
     * fire; the reset keys on the repository now, so it no longer has anything to do with this. */
    const options = useMemo(
        () => Array.from(new Set<string>([...loadedOptions, ...verifiedOptions, ...(imageValue ? [imageValue] : [])])),
        [loadedOptions, verifiedOptions, imageValue]
    )

    /* Everything the select holds was derived from one repository, the filter a search left behind
     * included, so all of it goes when the repository changes. */
    const clearOptionsOfPreviousRepository = useCallback(() => {
        setVerifiedOptions([])
        setFilteredOptions([])
        setFiltered(false)
    }, [])
    useResetImageTagWhenRepositoryChanges({ repository, form, fieldName: `${stackId}.${parameterName}`, onReset: clearOptionsOfPreviousRepository })

    const filterOptions = useCallback(
        async ({ value }) => {
            const tag = value?.trim()

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

    const displayOptions = useMemo(() => (filtered ? filteredOptions : options).map(mapStringToValueLabel), [filtered, filteredOptions, options])

    return (
        <div>
            <label className={classes.label}>{displayName} *</label>

            {/* Keyed on the repository so the menu's own filter text goes with the list it filtered,
                rather than sitting in the box describing a search that is no longer applied. */}
            <SearchableSingleSelect
                key={repository}
                onChange={(selected: { selected: string }) => onImageChange(selected.selected)}
                selected={imageValue}
                options={displayOptions}
                loading={imageLoading || tagsLoading}
                invalid={invalid}
                onBlur={onImageBlur}
                placeholder={displayName}
                onFilterChange={filterOptions}
            />
            {error && <div className={fieldClasses.validationError}>{error}</div>}
        </div>
    )
}
