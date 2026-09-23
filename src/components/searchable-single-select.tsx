import { Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import { useEffect, useRef } from 'react'
import { useDebouncedState } from '../hooks/use-debounce-state.ts'
import classes from './searchable-single-select.module.css'

export interface Option {
    value: string
    label: string
}

/* The filter field, in its own component because the menu mounts it afresh on every open, which is
 * what gives the focus below something to hang off.
 *
 * Input's own initialFocus focuses during the same commit as the click that opened the menu, and the
 * browser then finishes that click by moving focus onto the select itself, so the field ended up
 * open but not typed into. Focusing on the next frame lands after the click and sticks. */
const FilterField = ({ filter, loading, onChange, onClear }: { filter: string; loading: boolean; onChange: (value: string) => void; onClear: () => void }) => {
    const wrapper = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const frame = requestAnimationFrame(() => wrapper.current?.querySelector('input')?.focus())
        return () => cancelAnimationFrame(frame)
    }, [])

    return (
        <div className={classes.searchField}>
            <div className={classes.searchInput} ref={wrapper}>
                <Input dense value={filter} onChange={({ value }) => onChange(value ?? '')} placeholder="Filter options" loading={loading} />
            </div>

            <button className={classes.clearButton} disabled={!filter} onClick={onClear}>
                clear
            </button>
        </div>
    )
}

const Error = ({ msg, onRetryClick }: { msg: string; onRetryClick: () => void }) => {
    return (
        <div className={classes.error}>
            <div className={classes.errorInnerWrapper}>
                <span className={classes.loadingErrorLabel}>{msg}</span>
                <button className={classes.errorRetryButton} type="button" onClick={onRetryClick}>
                    Retry
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

    const onRetryClick = () => {
        console.log('Retry clicked')
    }

    return (
        <SingleSelect
            selected={hasSelectedInOptionList ? selected : ''}
            disabled={disabled}
            error={invalid}
            onChange={onChange}
            placeholder={placeholder}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            {/* Deliberately not a "value" prop: the select finds its selected option by matching any
                child's props.value, without first checking the child is an option. */}
            <FilterField filter={filter} loading={!error && loading} onChange={setFilterValue} onClear={() => setFilterValue('')} />

            {options.map(({ value, label }) => (
                <SingleSelectOption key={value} value={value} label={label} />
            ))}

            {hasSelectedInOptionList && selected && <SingleSelectOption className={classes.invisibleOption} value={selected} label="" />}
            {error && <Error msg={error} onRetryClick={onRetryClick} />}
        </SingleSelect>
    )
}
