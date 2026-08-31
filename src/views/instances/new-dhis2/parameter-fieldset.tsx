import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-final-form'
import { useDhis2StackParameters } from '../../../hooks/index.ts'
import { ParameterField } from './fields/parameter-field.tsx'
import styles from './styles.module.css'

export type Dhis2StackName = 'dhis2-core' | 'dhis2-db' | 'pgadmin' | 'minio' | 'chap' | 'dhis2-v2'
export type Dhis2PrimaryField =
    | 'IMAGE_TAG'
    | 'IMAGE_REPOSITORY'
    | 'DATABASE_ID'
    | 'PGADMIN_USERNAME'
    | 'PGADMIN_PASSWORD'
    | 'PGADMIN_CONFIRM_PASSWORD'
    | 'GOOGLE_SERVICE_ACCOUNT_EMAIL'
    | 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'
    | 'DATABASE_SIZE'
    | 'REDIS_STORAGE_SIZE'
export type Dhis2StackPrimaryParameters = Map<Dhis2StackName, Set<Dhis2PrimaryField>>

export const ParameterFieldset: FC<{ stackId: Dhis2StackName; displayName: string; formMode?: 'create' | 'update' }> = ({ stackId, displayName, formMode = 'create' }) => {
    const form = useForm()
    const { loading, error, primaryParameters, secondaryParameters, initialParameterValues, sensitiveParameters } = useDhis2StackParameters(stackId)
    const areParameterValuesInitialized = useMemo(() => {
        const { values } = form.getState()
        const valuesLookup = new Set(Object.keys(values[stackId] ?? {}))
        return Object.keys(initialParameterValues).every((key) => valuesLookup.has(key))
    }, [form, stackId, initialParameterValues])

    useEffect(() => {
        if (initialParameterValues && !areParameterValuesInitialized) {
            // Existing form values win over stack defaults so edit mode keeps the deployment's current values.
            form.initialize((values) => ({
                ...values,
                [stackId]: { ...initialParameterValues, ...(values[stackId] ?? {}) },
            }))
        }
    }, [form, stackId, initialParameterValues, areParameterValuesInitialized])

    return (
        <>
            {loading && (
                <Center>
                    <CircularLoader />
                </Center>
            )}

            {error && !loading && (
                <NoticeBox error title="Could not load parameter fields">
                    {error.message}
                </NoticeBox>
            )}

            {!error && !loading && primaryParameters && (
                <fieldset className={cx(styles.fieldset, styles.parameters, styles.primary)}>
                    <legend className={styles.legend}>{displayName}</legend>
                    {primaryParameters.map(({ displayName, parameterName }) => (
                        <ParameterField
                            stackId={stackId}
                            key={parameterName}
                            parameterName={parameterName}
                            displayName={displayName}
                            sensitive={sensitiveParameters[parameterName]}
                            formMode={formMode}
                        />
                    ))}
                </fieldset>
            )}

            {!error && !loading && secondaryParameters && (
                <details>
                    <summary className={styles.summary}>Advanced configuration</summary>
                    <fieldset className={cx(styles.fieldset, styles.parameters, styles.secondary)}>
                        {!error &&
                            !loading &&
                            secondaryParameters &&
                            secondaryParameters.map(({ displayName, parameterName }) => (
                                <ParameterField
                                    stackId={stackId}
                                    key={parameterName}
                                    parameterName={parameterName}
                                    displayName={displayName}
                                    sensitive={sensitiveParameters[parameterName]}
                                    formMode={formMode}
                                />
                            ))}
                    </fieldset>
                </details>
            )}

            <hr className={styles.hr} />
        </>
    )
}
