import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useForm } from 'react-final-form'
import { useDhis2StackParameters } from '../../../hooks'
import { DHIS2_STACK_ID } from './constants'
import { useEffect, useMemo } from 'react'
import { ParameterField } from './parameter-field'

export const ParameterFieldSet = () => {
    const form = useForm()
    const { loading, error, primaryParameters, secondaryParameters, initialParameterValues } = useDhis2StackParameters(DHIS2_STACK_ID)
    console.log(initialParameterValues)

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
        <fieldset>
            <legend>Instance configuration</legend>
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
            {!error && !loading && primaryParameters && primaryParameters.map(({ name }) => <ParameterField key={name} name={name} />)}
            <details>
                <summary>Advanced configuration</summary>
                {!error && !loading && secondaryParameters && secondaryParameters.map(({ name }) => <ParameterField key={name} name={name} />)}
            </details>
        </fieldset>
    )
}
