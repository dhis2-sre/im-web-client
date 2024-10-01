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
    setFoundSearchValue: (value: boolean) => void
    foundSearchValue: boolean
    checkSearchValueExists: (tag: string) => Promise<boolean>
    refetch: () => void
}

export const SearchableSingleSelect: FC<SearchableSingleSelectProps> = ({
    onChange,
    options,
    loading,
    selected,
    refetch,
    checkSearchValueExists,
    placeholder,
    foundSearchValue,
    setFoundSearchValue,
}) => {
    const [inputValue, setInputValue] = useState<string>('')

    const { setValue: setDebouncedValue } = useDebouncedState({
        initialValue: inputValue,
        delay: 500,
        onSetDebouncedValue: async (value: string) => {
            if (value) {
                const exists = await checkSearchValueExists(value)
                setFoundSearchValue(exists)
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

    return (
        <div>
            <SingleSelect selected={selected} onChange={onChange}>
                <div>
                    <Input
                        dense
                        initialFocus
                        value={inputValue}
                        className={classes.searchField}
                        onChange={handleInputChange}
                        loading={loading}
                        placeholder={placeholder || 'Type and press Enter'}
                        onKeyDown={(_, event) => {
                            if (event.key === 'Enter') {
                                checkSearchValueExists(inputValue)
                            }
                        }}
                    />
                </div>
                {!foundSearchValue && inputValue && <div className={classes.error}>{'Image tag does not exist'}</div>}

                {options.map(({ value, label }) => (
                    <SingleSelectOption key={value} value={value} label={label} />
                ))}
            </SingleSelect>
        </div>
    )
}
