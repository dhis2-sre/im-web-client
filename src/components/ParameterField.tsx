import {
    InputField,
    CheckboxField,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import cx from 'classnames'
import styles from './ParameterField.module.css'
import { useApi } from '../api/useApi'
import { getIntergrations } from '../api/intergrations'
import { useEffect, useRef } from 'react'

export type ParameterName =
    | 'CHART_VERSION'
    | 'COMMAND'
    | 'CORE_RESOURCES_REQUESTS_CPU'
    | 'CORE_RESOURCES_REQUESTS_MEMORY'
    | 'DATABASE_HOSTNAME'
    | 'DATABASE_ID'
    | 'DATABASE_NAME'
    | 'DATABASE_PASSWORD'
    | 'DATABASE_SIZE'
    | 'DATABASE_USERNAME'
    | 'DATABASE_VERSION'
    | 'DB_RESOURCES_REQUESTS_CPU'
    | 'DB_RESOURCES_REQUESTS_MEMORY'
    | 'DHIS2_DATABASE_DATABASE'
    | 'DHIS2_DATABASE_HOSTNAME'
    | 'DHIS2_DATABASE_PASSWORD'
    | 'DHIS2_DATABASE_PORT'
    | 'DHIS2_DATABASE_USERNAME'
    | 'DHIS2_HOME'
    | 'DHIS2_HOSTNAME'
    | 'FLYWAY_MIGRATE_OUT_OF_ORDER'
    | 'FLYWAY_REPAIR_BEFORE_MIGRATION'
    | 'IMAGE_PULL_POLICY'
    | 'IMAGE_REPOSITORY'
    | 'IMAGE_TAG'
    | 'INSTALL_REDIS'
    | 'INSTANCE_TTL'
    | 'JAVA_OPTS'
    | 'LIVENESS_PROBE_TIMEOUT_SECONDS'
    | 'PAYLOAD'
    | 'PGADMIN_PASSWORD'
    | 'PGADMIN_USERNAME'
    | 'READINESS_PROBE_TIMEOUT_SECONDS'
    | 'REPLICA_COUNT'
    | 'RESOURCES_REQUESTS_CPU'
    | 'RESOURCES_REQUESTS_MEMORY'
    | 'SOURCE_ID'
    | 'PRESET_ID'
    | 'STARTUP_PROBE_FAILURE_THRESHOLD'
    | 'STARTUP_PROBE_PERIOD_SECONDS'

type ParameterFieldProps = {
    name: ParameterName
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

const getAsyncParameterFieldOptions = (key: ParameterName, repository) => {
    switch (key) {
        case 'IMAGE_TAG':
            return {
                key,
                payload: {
                    organization: 'dhis2',
                    repository,
                },
            }
        case 'IMAGE_REPOSITORY':
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

const getOptions = (value, data) => {
    if (data) {
        return Object.values(data)
    } else {
        return value ? [value] : []
    }
}

const AsyncParameterDropdownField = ({
    name,
    onChange,
    value,
    disabled,
    repository,
    required,
}: ParameterFieldProps) => {
    const prevRepositoryRef = useRef(repository)
    const { data, error, isFetching, refetch } = useApi(
        getIntergrations,
        getAsyncParameterFieldOptions(name, repository)
    )

    useEffect(() => {
        if (repository !== prevRepositoryRef.current) {
            prevRepositoryRef.current = repository
            refetch()
        }
    }, [refetch, repository])

    return (
        <SingleSelectField
            label={toTitleCase(name)}
            className={styles.field}
            disabled={disabled || isFetching}
            selected={value}
            required={required}
            onChange={({ selected: value }) => onChange({ name, value })}
            error={!!error}
            validationText={error ? 'Could not load options' : undefined}
        >
            {getOptions(value, data).map((value) => (
                <SingleSelectOption key={value} value={value} label={value} />
            ))}
        </SingleSelectField>
    )
}

export const ParameterField = ({
    name,
    onChange,
    value,
    disabled,
    repository,
    required,
}: ParameterFieldProps) => {
    switch (name) {
        case 'DATABASE_ID':
        case 'IMAGE_REPOSITORY':
        case 'IMAGE_TAG':
        case 'SOURCE_ID':
        case 'PRESET_ID':
            return (
                <AsyncParameterDropdownField
                    name={name}
                    onChange={onChange}
                    value={value}
                    disabled={disabled}
                    required={required}
                    repository={repository}
                />
            )

        case 'INSTALL_REDIS':
        case 'FLYWAY_MIGRATE_OUT_OF_ORDER':
        case 'FLYWAY_REPAIR_BEFORE_MIGRATION':
            return (
                <CheckboxField
                    className={cx(styles.field, styles.checkboxfield)}
                    name={name}
                    label={toTitleCase(name)}
                    value={value}
                    onChange={({ checked }) =>
                        onChange({ name, value: checked ? 'true' : 'false' })
                    }
                    required={required}
                    checked={value === 'true'}
                    disabled={disabled}
                />
            )

        default:
            return (
                <InputField
                    className={styles.field}
                    name={name}
                    label={toTitleCase(name)}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                />
            )
    }
}
