import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { useForm } from 'react-final-form'
import { useDhis2StackParameters } from '../../../hooks'
import { DHIS2_STACK_ID } from './constants'
import { useEffect, useMemo } from 'react'
import { ParameterField } from './fields/parameter-field'
import styles from './styles.module.css'

export const ParameterFieldset = () => {
    const form = useForm()
    const { loading, error, primaryParameters, secondaryParameters, initialParameterValues } = useDhis2StackParameters(DHIS2_STACK_ID)

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
        <div className={styles.container}>
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
                    <legend className={styles.legend}>Instance configuration</legend>
                    {primaryParameters.map(({ name, parameterName }) => (
                        <ParameterField key={name} name={name} parameterName={parameterName} />
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
                            secondaryParameters.map(({ name, parameterName }) => <ParameterField key={name} name={name} parameterName={parameterName} />)}
                    </fieldset>
                </details>
            )}

            <hr className={styles.hr} />
        </div>
    )
}
