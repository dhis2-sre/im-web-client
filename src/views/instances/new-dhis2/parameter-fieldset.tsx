import { Center, CircularLoader, CheckboxFieldFF, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { FC, useEffect, useMemo } from 'react'
import { Field, useField, useForm } from 'react-final-form'
import { useDhis2StackParameters } from '../../../hooks/index.ts'
import { ParameterField } from './fields/parameter-field.tsx'
import styles from './styles.module.css'

export type Dhis2StackName = 'dhis2-core' | 'dhis2-db' | 'pgadmin'
export type Dhis2PrimaryField = 'IMAGE_TAG' | 'IMAGE_REPOSITORY' | 'DATABASE_ID' | 'PGADMIN_EMAIL' | 'PGADMIN_PASSWORD' | 'PGADMIN_CONFIRM_PASSWORD'
export type Dhis2StackPrimaryParameters = Map<Dhis2StackName, Set<Dhis2PrimaryField>>

export const ParameterFieldset: FC<{ stackId: Dhis2StackName; displayName: string; optional?: boolean }> = ({ stackId, displayName, optional }) => {
    const form = useForm()
    const { loading, error, primaryParameters, secondaryParameters, initialParameterValues } = useDhis2StackParameters(stackId)
    const includeStackFieldName = `include_${stackId}`
    const {
        input: { value: includeStackFieldValue },
    } = useField(includeStackFieldName, {
        subscription: { value: true },
    })
    const shouldShowParameterFields = !optional || includeStackFieldValue
    const areParameterValuesInitialized = useMemo(() => {
        const { values } = form.getState()
        const valuesLookup = new Set(Object.keys(values[stackId] ?? {}))
        return Object.keys(initialParameterValues).every((key) => valuesLookup.has(key))
    }, [form, stackId, initialParameterValues])

    useEffect(() => {
        if (initialParameterValues && !areParameterValuesInitialized) {
            form.initialize((values) => ({ ...values, [stackId]: initialParameterValues }))
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
                    <legend className={styles.legend}>
                        {optional ? (
                            <Field type="checkbox" name={includeStackFieldName} label={displayName} component={CheckboxFieldFF} className={styles.optionalStackCheckbox} />
                        ) : (
                            displayName
                        )}
                    </legend>
                    {shouldShowParameterFields &&
                        primaryParameters.map(({ displayName, parameterName }) => (
                            <ParameterField stackId={stackId} key={parameterName} parameterName={parameterName} displayName={displayName} />
                        ))}
                </fieldset>
            )}

            {!error && !loading && secondaryParameters && shouldShowParameterFields && (
                <details>
                    <summary className={styles.summary}>Advanced configuration {shouldShowParameterFields}</summary>
                    <fieldset className={cx(styles.fieldset, styles.parameters, styles.secondary)}>
                        {!error &&
                            !loading &&
                            secondaryParameters &&
                            secondaryParameters.map(({ displayName, parameterName }) => (
                                <ParameterField stackId={stackId} key={parameterName} parameterName={parameterName} displayName={displayName} />
                            ))}
                    </fieldset>
                </details>
            )}

            {shouldShowParameterFields && <hr className={styles.hr} />}
        </>
    )
}
