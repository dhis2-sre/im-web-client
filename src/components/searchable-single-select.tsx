import i18n from '@dhis2/d2-i18n'
import { CircularLoader, Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React, { forwardRef, useEffect, useState } from 'react'
import { useDebouncedState } from '../hooks/use-debounce-state.ts'
import classes from './searchable-single-select.module.css'

export interface Option {
    value: string
    label: string
}

const Loader = forwardRef<HTMLDivElement, object>(function Loader(_, ref) {
    return (
        <div ref={ref} className={classes.loader}>
            <CircularLoader />
        </div>
    )
})

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
    onEndReached?: () => void
    onRetryClick: () => void
    dense?: boolean
    options: Option[]
    placeholder: string
    prefix?: string
    showEndLoader: boolean
    loading: boolean
    disabled?: boolean
    selected?: string
    invalid?: boolean
    error?: string
    showAllOption?: boolean
    onBlur?: () => void
    onFocus?: () => void
}

export const SearchableSingleSelect = ({
    invalid,
    disabled,
    error,
    dense,
    loading,
    placeholder,
    prefix,
    onBlur,
    onChange,
    onEndReached,
    onFilterChange,
    onFocus,
    onRetryClick,
    options,
    selected,
    showAllOption,
    showEndLoader,
}: SearchableSingleSelectPropTypes) => {
    const [loadingSpinnerRef, setLoadingSpinnerRef] = useState<HTMLElement>()

    const { liveValue: filter, setValue: setFilterValue } = useDebouncedState<string>({
        initialValue: '',
        onSetDebouncedValue: (value: string) => onFilterChange({ value }),
    })

    useEffect(() => {
        if (loadingSpinnerRef && !loading) {
            const observer = new IntersectionObserver(
                (entries) => {
                    const [{ isIntersecting }] = entries
                    if (isIntersecting) {
                        onEndReached?.()
                    }
                },
                { threshold: 0.8 }
            )
            observer.observe(loadingSpinnerRef)
            return () => observer.disconnect()
        }
    }, [loadingSpinnerRef, loading, onEndReached])

    const hasSelectedInOptionList = !!options.find(({ value }) => value === selected)
    const withAllOptions = showAllOption ? [{ value: '', label: i18n.t('All') }, ...options] : options

    return (
        <SingleSelect
            selected={hasSelectedInOptionList ? selected : ''}
            disabled={disabled}
            error={invalid}
            onChange={onChange}
            placeholder={placeholder}
            prefix={prefix}
            onBlur={onBlur}
            onFocus={onFocus}
            dense={dense}
        >
            <div className={classes.searchField}>
                <div className={classes.searchInput}>
                    <Input dense initialFocus value={filter} onChange={({ value }) => setFilterValue(value ?? '')} placeholder={i18n.t('Filter options')} />
                </div>
                <button className={classes.clearButton} disabled={!filter} onClick={() => setFilterValue('')}>
                    clear
                </button>
            </div>

            {withAllOptions.map(({ value, label }) => (
                <SingleSelectOption key={value} value={value} label={label} />
            ))}

            {hasSelectedInOptionList && selected && <SingleSelectOption className={classes.invisibleOption} value={selected} label="" />}

            {!error && !loading && showEndLoader && (
                <Loader
                    ref={(ref) => {
                        if (!!ref && ref !== loadingSpinnerRef) {
                            setLoadingSpinnerRef(ref)
                        }
                    }}
                />
            )}

            {!error && loading && <Loader />}

            {error && <Error msg={error} onRetryClick={onRetryClick} />}
        </SingleSelect>
    )
}
