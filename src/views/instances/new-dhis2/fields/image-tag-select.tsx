import { FC, useEffect, useState, useCallback } from 'react'
import { useField, useForm } from 'react-final-form'
import classes from '../../../../components/searchable-single-select.module.css'
import { SearchableSingleSelect, Option } from '../../../../components/searchable-single-select.tsx'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { IMAGE_TAG } from '../constants.ts'
import { IMAGE_REPOSITORY_FIELD_NAME } from './image-repository-select.tsx'
import { mapStringToValueLabel } from './map-string-to-value-label.tsx'

const IMAGE_TAG_FIELD_NAME = `['dhis2-core'].${IMAGE_TAG}`

interface ImageTagSelectProps {
    displayName: string
}

export const ImageTagSelect: FC<ImageTagSelectProps> = ({ displayName }) => {
    const form = useForm()
    const [options, setOptions] = useState<Option[]>([])
    const [tag, setTag] = useState<string>('')
    const [tagExists, setTagExists] = useState<boolean>(false)

    const {
        meta: { initial: initialValue },
    } = useField<string>(IMAGE_TAG_FIELD_NAME, { subscription: { initial: true } })

    const {
        input: { value: repository },
    } = useField<string>(IMAGE_REPOSITORY_FIELD_NAME, { subscription: { value: true } })

    const [{ data }, refetch] = useAuthAxios({ url: '/integrations', method: 'POST', data: {} }, { manual: true, autoCatch: true })

    const [{ loading: imageLoading }, checkImageExists] = useAuthAxios({ url: `/integrations/image-exists/${repository}/{tag}`, method: 'GET' }, { manual: true, autoCatch: false })

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

    useEffect(() => {
        if (data) {
            const mappedOptions = data.map(mapStringToValueLabel)
            setOptions(mappedOptions)

            const currentSelectedValue = form.getState().values['dhis2-core']?.IMAGE_TAG
            if (currentSelectedValue && !mappedOptions.some((option) => option.value === currentSelectedValue)) {
                form.change(IMAGE_TAG_FIELD_NAME, undefined)
                form.blur(IMAGE_TAG_FIELD_NAME)
            }
        }
    }, [data, form])

    const handleTagCheck = useCallback(
        async (tag: string): Promise<boolean> => {
            const existsInOptions = options.some((option) => option.label.startsWith(tag));
            setTagExists(existsInOptions)

            if (existsInOptions) {
                setOptions((prevOptions) => {
                    const filteredOptions = prevOptions.filter((option) => option.value !== tag)
                    return [{ value: tag, label: tag }, ...filteredOptions]
                })
                return true
            }

            try {
                const response = await checkImageExists({
                    url: `/integrations/image-exists/${repository}/${tag}`,
                })

                if (response.status === 200) {
                    // Add the new tag at the top of the options list
                    setOptions((prevOptions) => {
                        const filteredOptions = prevOptions.filter((option) => option.value !== tag)
                        return [{ value: tag, label: tag }, ...filteredOptions]
                    })

                    setTag(tag)
                    form.change(IMAGE_TAG_FIELD_NAME, tag)
                    setTagExists(true)
                    return true
                }
            } catch (error) {
                if (error?.response?.status === 404) {
                    setTag('')
                    form.change(IMAGE_TAG_FIELD_NAME, undefined)
                    setTagExists(false)
                    return false
                }
            }
            return false
        },
        [checkImageExists, form, repository, options]
    )

    const handleChange = (selected: { selected: string }) => {
        form.change(IMAGE_TAG_FIELD_NAME, selected.selected)
    }

    return (
        <div>
            <label className={classes.label}>{displayName} *</label>
            <SearchableSingleSelect
                onChange={handleChange}
                foundSearchValue={tagExists}
                setFoundSearchValue={setTagExists}
                selected={form.getState().values['dhis2-core']?.IMAGE_TAG || tag || ''}
                options={options.length === 0 && initialValue ? [{ value: initialValue, label: initialValue }] : options}
                loading={imageLoading}
                placeholder={displayName}
                checkSearchValueExists={handleTagCheck}
                refetch={refetch}
            />
        </div>
    )
}
