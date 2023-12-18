import { Center, CircularLoader, CheckboxFieldFF, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { Field, useField, useForm } from 'react-final-form'
import { useStackParameters } from '../../../hooks'
import { FC, useEffect, useMemo } from 'react'
import { ParameterField } from './fields/parameter-field'
import styles from './styles.module.css'

export const ParameterFieldset: FC<{ stackId: string; displayName: string; optional?: boolean }> = ({ stackId, displayName, optional }) => {
    const form = useForm()
    const { loading, error, primaryParameters, secondaryParameters, initialParameterValues } = useStackParameters(stackId)
    const includeStackFieldName = `include_${stackId}`
    const {
        input: { value: includeStackFieldValue },
    } = useField(includeStackFieldName, {
        subscription: { value: true },
    })
    const shouldShowParameterFields = !optional || includeStackFieldValue
    const areParameterValuesInitialized = useMemo(() => {
        const { values } = form.getState()
        const valuesLookup = new Set(Object.keys(values))
        return Object.keys(initialParameterValues).every((key) => valuesLookup.has(key))
    }, [form, initialParameterValues])

    useEffect(() => {
        if (initialParameterValues && !areParameterValuesInitialized) {
            form.initialize((values) => ({ ...values, ...initialParameterValues }))
        }
    }, [form, initialParameterValues, areParameterValuesInitialized])

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
                            <Field
                                type="checkbox"
                                name={includeStackFieldName}
                                label={`Include ${displayName}`}
                                component={CheckboxFieldFF}
                                className={styles.optionalStackCheckbox}
                            />
                        ) : (
                            displayName
                        )}
                    </legend>
                    {shouldShowParameterFields &&
                        primaryParameters.map(({ displayName, parameterName }) => <ParameterField key={displayName} displayName={displayName} parameterName={parameterName} />)}
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
                                <ParameterField key={displayName} displayName={displayName} parameterName={parameterName} />
                            ))}
                    </fieldset>
                </details>
            )}

            {shouldShowParameterFields && <hr className={styles.hr} />}
        </>
    )
}
