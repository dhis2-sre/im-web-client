import i18n from '@dhis2/d2-i18n'
import { Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import { FC, useEffect, useState } from 'react'
import { useDebouncedState } from '../hooks/use-debounce-state.ts'
import classes from './searchable-single-select.module.css'

export interface Option {
    value: string
    label: string
}

interface OnChangeProps {
    selected: string
}

interface SearchableSingleSelectProps {
    onChange: (props: OnChangeProps) => void
    options: Option[]
    placeholder: string
    loading: boolean
    selected?: string
    setTagExists: (value: boolean) => void
    tagExists: boolean
    onTagCheck: (tag: string) => Promise<boolean>
    refetch: () => void
}

export const SearchableSingleSelect: FC<SearchableSingleSelectProps> = ({ onChange, options, loading, selected, refetch, onTagCheck, placeholder, tagExists, setTagExists }) => {
    const [inputValue, setInputValue] = useState<string>('')

    const { setValue: setDebouncedValue } = useDebouncedState({
        initialValue: inputValue,
        delay: 500,
        onSetDebouncedValue: async (value: string) => {
            if (value) {
                const exists = await onTagCheck(value)
                setTagExists(exists)
            }
        },
    })

    const handleInputChange = ({ value }: { value: string }) => {
        setInputValue(value)
        setDebouncedValue(value)
    }

    useEffect(() => {
        if (!inputValue) {
            refetch()
        }
    }, [inputValue, refetch])

    console.log(tagExists)

    return (
        <div>
            <SingleSelect selected={selected} onChange={onChange} loading={loading}>
                <div>
                    <Input
                        dense
                        initialFocus
                        value={inputValue}
                        className={classes.searchField}
                        onChange={handleInputChange}
                        placeholder={i18n.t(placeholder || 'Type and press Enter')}
                        onKeyDown={(_, event) => {
                            if (event.key === 'Enter') {
                                onTagCheck(inputValue)
                            }
                        }}
                    />
                </div>
                {!tagExists && inputValue && <div className={classes.error}>{i18n.t('Image tag does not exist')}</div>}

                {options.map(({ value, label }) => (
                    <SingleSelectOption key={value} value={value} label={label} />
                ))}
            </SingleSelect>
        </div>
    )
}
