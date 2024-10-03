import i18n from '@dhis2/d2-i18n'
import { Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React from 'react'
import { useDebouncedState } from '../hooks/use-debounce-state.ts'
import classes from './searchable-single-select.module.css'

export interface Option {
    value: string
    label: string
}

function Error({ msg, onRetryClick }: { msg: string; onRetryClick: () => void }) {
    return (
        <div className={classes.error}>
            <div className={classes.errorInnerWrapper}>
                <span className={classes.loadingErrorLabel}>{msg}</span>
                <button className={classes.errorRetryButton} type="button" onClick={onRetryClick}>
                    {i18n.t('Retry')}
                </button>
            </div>
        </div>
    )
}

type OnChange = ({ selected }: { selected: string }) => void
type OnFilterChange = ({ value }: { value: string }) => void
interface SearchableSingleSelectPropTypes {
    onChange: OnChange
    onFilterChange: OnFilterChange
    options: Option[]
    placeholder: string
    loading: boolean
    disabled?: boolean
    selected?: string
    invalid?: boolean
    error?: string
    onBlur?: () => void
    onFocus?: () => void
}

export const SearchableSingleSelect = ({
    invalid,
    disabled,
    error,
    loading,
    placeholder,
    onBlur,
    onChange,
    onFilterChange,
    onFocus,
    options,
    selected,
}: SearchableSingleSelectPropTypes) => {
    const { liveValue: filter, setValue: setFilterValue } = useDebouncedState<string>({
        initialValue: '',
        onSetDebouncedValue: (value: string) => onFilterChange({ value }),
    })

    const hasSelectedInOptionList = !!options.find(({ value }) => value === selected)

    return (
        <SingleSelect
            // Initially we potentially have a selected value, but we might not have
            // fetched the corresponding label yet. Therefore we don't want to pass in
            // any value to the "selected" prop, as otherwise an error will be thrown
            selected={hasSelectedInOptionList ? selected : ''}
            disabled={disabled}
            error={invalid}
            onChange={onChange}
            placeholder={placeholder}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <div className={classes.searchField}>
                <div className={classes.searchInput}>
                    <Input
                        dense
                        initialFocus
                        value={filter}
                        onChange={({ value }) => setFilterValue(value ?? '')}
                        placeholder={i18n.t('Filter options')}
                        loading={!error && loading}
                    />
                </div>

                <button className={classes.clearButton} disabled={!filter} onClick={() => setFilterValue('')}>
                    clear
                </button>
            </div>

            {options.map(({ value, label }) => (
                <SingleSelectOption key={value} value={value} label={label} />
            ))}

            {hasSelectedInOptionList && selected && <SingleSelectOption className={classes.invisibleOption} value={selected} label="" />}

            {error && <Error msg={error} onRetryClick={onRetryClick} />}
        </SingleSelect>
    )
}
