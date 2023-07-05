import { InputField, CheckboxField, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import cx from 'classnames'
import styles from './ParameterField.module.css'
import { useApi } from '../api/useApi'
import { getIntergrations } from '../api/intergrations'
import { useEffect, useRef } from 'react'

export const DATABASE_ID = 'DATABASE_ID'
export const FLYWAY_MIGRATE_OUT_OF_ORDER = 'FLYWAY_MIGRATE_OUT_OF_ORDER'
export const FLYWAY_REPAIR_BEFORE_MIGRATION = 'FLYWAY_REPAIR_BEFORE_MIGRATION'
export const IMAGE_REPOSITORY = 'IMAGE_REPOSITORY'
export const IMAGE_TAG = 'IMAGE_TAG'
export const IMAGE_PULL_POLICY = 'IMAGE_PULL_POLICY'
export const INSTALL_REDIS = 'INSTALL_REDIS'
export const SOURCE_ID = 'SOURCE_ID'
export const PRESET_ID = 'PRESET_ID'

export const DROPDOWN_PARAMETER_NAMES = new Set([DATABASE_ID, IMAGE_REPOSITORY, IMAGE_TAG, IMAGE_PULL_POLICY, SOURCE_ID, PRESET_ID])

export const CHECKBOX_PARAMETER_NAMES = new Set([INSTALL_REDIS, FLYWAY_MIGRATE_OUT_OF_ORDER, FLYWAY_REPAIR_BEFORE_MIGRATION])

type ParameterFieldProps = {
    name: string
    onChange: Function
    value: string
    disabled?: boolean
    required?: boolean
    repository?: string
}

const toTitleCase = (string) =>
    string
        .toLowerCase()
        .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())

const getAsyncParameterFieldOptions = (key, repository) => {
    switch (key) {
        case IMAGE_TAG:
            return {
                key,
                payload: {
                    organization: 'dhis2',
                    repository,
                },
            }
        case IMAGE_REPOSITORY:
            return {
                key,
                payload: {
                    organization: 'dhis2',
                },
            }
        default:
            return { key }
    }
}

const getOptions = (name: string, value, data) => {
    if (!data) {
        return value ? [{ value, label: value }] : []
    }

    if (name === DATABASE_ID) {
        /* For this field the API returns an object where the
         * key is the ID and the value is the label */
        return Object.entries(data).map(([value, label]) => ({
            value,
            label,
        }))
    }

    // Normally the API returns an array of strings
    return data.map((value) => ({ value, label: value }))
}

const AsyncParameterDropdownField = ({ name, onChange, value, disabled, repository, required }: ParameterFieldProps) => {
    const prevRepositoryRef = useRef(repository)
    const { data, error, isFetching, refetch } = useApi(getIntergrations, getAsyncParameterFieldOptions(name, repository))

    useEffect(() => {
        if (repository !== prevRepositoryRef.current) {
            prevRepositoryRef.current = repository
            refetch()
        }
    }, [refetch, repository])

    return (
        <SingleSelectField
            label={toTitleCase(name)}
            filterable={true}
            className={styles.field}
            disabled={disabled || isFetching}
            selected={value}
            required={required}
            onChange={({ selected: value }) => onChange({ name, value })}
            error={!!error}
            validationText={error ? 'Could not load options' : undefined}
        >
            {getOptions(name, value, data).map(({ value, label }) => (
                <SingleSelectOption key={value} value={value} label={label} />
            ))}
        </SingleSelectField>
    )
}

export const ParameterField = ({ name, onChange, value, disabled, repository, required }: ParameterFieldProps) => {
    if (DROPDOWN_PARAMETER_NAMES.has(name)) {
        return <AsyncParameterDropdownField name={name} onChange={onChange} value={value} disabled={disabled} required={required} repository={repository} />
    } else if (CHECKBOX_PARAMETER_NAMES.has(name)) {
        return (
            <CheckboxField
                className={cx(styles.field, styles.checkboxfield)}
                name={name}
                label={toTitleCase(name)}
                value={value}
                onChange={({ checked }) => onChange({ name, value: checked ? 'true' : 'false' })}
                required={required}
                checked={value === 'true'}
                disabled={disabled}
            />
        )
    } else {
        return <InputField className={styles.field} name={name} label={toTitleCase(name)} value={value} onChange={onChange} required={required} disabled={disabled} />
    }
}
