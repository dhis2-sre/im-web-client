import { Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
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
            <div className={classes.searchField}>
                <div className={classes.searchInput}>
                    <Input dense initialFocus value={filter} onChange={({ value }) => setFilterValue(value ?? '')} placeholder="Filter options" loading={!error && loading} />
                </div>

                <button className={classes.clearButton} disabled={!filter} onClick={() => setFilterValue('')}>
                    clear
                </button>
            </div>

            {options.map(({ value, label }) => (
                <SingleSelectOption key={value} value={value} label={label} />
            ))}

            {hasSelectedInOptionList && selected && <SingleSelectOption className={classes.invisibleOption} value={selected} label="" />}
            {!hasSelectedInOptionList && <div className={classes.error}>Image tag does not exist</div>}
            {error && <Error msg={error} onRetryClick={onRetryClick} />}
        </SingleSelect>
    )
}
