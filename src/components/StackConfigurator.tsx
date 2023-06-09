import { Divider, InputField } from '@dhis2/ui'
import { getStack } from '../api/stacks'
import { Stack } from '../types/stack'
import { useApi } from '../api/useApi'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './StackConfigurator.module.css'
import { ParameterField, ParameterName } from './ParameterField'

// type ParameterRecord = Record<ParameterName, string>
type ParameterRecord = any

const toArray = (object) =>
    Object.entries(object).map(([name, value]) => ({ name, value }))

const toKeyedObject = (array): ParameterRecord =>
    array.reduce((acc, { Name: name, DefaultValue: value }) => {
        acc[name] = value ?? ''
        return acc
    }, {})

const getRepositoryValueForImageTag = (
    name: ParameterName,
    requiredParameters,
    optionalParameters
) =>
    name === 'IMAGE_TAG'
        ? requiredParameters['IMAGE_REPOSITORY'] ??
          optionalParameters['IMAGE_REPOSITORY']
        : undefined

const computeNewParameters = (
    currentParameters: ParameterRecord,
    { name, value }: { name: ParameterName; value: string }
): ParameterRecord => {
    /* `IMAGE_TAG` depends on `IMAGE_REPOSITORY` so
     * the `IMAGE_TAG` value needs to be cleared when
     * `IMAGE_REPOSITORY` changes.
     * Note: we can add more if clauses for dependent fields
     * here, but the current implementation does not support
     * interdependencies between optional and required parameters,
     * because it is called inside the setRequiredStackParameters
     * and setOptionalStackParameters callbacks. */
    if (name === 'IMAGE_REPOSITORY' && currentParameters['IMAGE_TAG']) {
        currentParameters['IMAGE_TAG'] = ''
    }

    return {
        ...currentParameters,
        [name]: value,
    }
}

export const StackConfigurator = forwardRef(function StackConfigurator(
    { name, disabled }: { name: string; disabled: boolean },
    ref
) {
    const [instanceName, setInstanceName] = useState('')
    const [requiredStackParameters, setRequiredStackParameters] = useState({})
    const [optionalStackParameters, setOptionalStackParameters] = useState({})
    const {
        data: stack,
        isLoading,
        isFetching,
        refetch,
    } = useApi<Stack>(getStack, { name })

    useImperativeHandle(
        ref,
        () => ({
            getStackParameters() {
                return {
                    name: instanceName,
                    requiredParameters: toArray(requiredStackParameters),
                    optionalParameters: toArray(optionalStackParameters),
                }
            },
        }),
        [instanceName, optionalStackParameters, requiredStackParameters]
    )

    useEffect(() => {
        if (!isFetching && stack && stack.name !== name) {
            refetch()
        }
    }, [name, refetch, stack, isFetching])

    useEffect(() => {
        if (stack) {
            setRequiredStackParameters(toKeyedObject(stack.requiredParameters))
            setOptionalStackParameters(toKeyedObject(stack.optionalParameters))
        }
    }, [stack, setRequiredStackParameters, setOptionalStackParameters])

    if (isLoading) {
        return null
    }

    const onRequiredInputChange = (parameter) => {
        setRequiredStackParameters((currentParameters) =>
            computeNewParameters(currentParameters, parameter)
        )
    }

    const onOptionalInputChange = (parameter) => {
        setOptionalStackParameters((currentParameters) =>
            computeNewParameters(currentParameters, parameter)
        )
    }

    return (
        <div>
            <div className={styles.container}>
                <InputField
                    className={styles.field}
                    label="Name"
                    value={instanceName}
                    onChange={({ value }) => setInstanceName(value)}
                    required
                    disabled={disabled}
                />
                {Object.entries(requiredStackParameters).map(
                    ([name, value]: any) => (
                        <ParameterField
                            key={name}
                            name={name}
                            value={value}
                            repository={getRepositoryValueForImageTag(
                                name,
                                requiredStackParameters,
                                optionalStackParameters
                            )}
                            onChange={onRequiredInputChange}
                            required
                            disabled={disabled}
                        />
                    )
                )}
            </div>
            <Divider />
            <h4 className={styles.subheader}>Optional parameters</h4>
            <div className={styles.container}>
                {Object.entries(optionalStackParameters).map(
                    ([name, value]: any) => (
                        <ParameterField
                            key={name}
                            name={name}
                            value={value}
                            repository={getRepositoryValueForImageTag(
                                name,
                                requiredStackParameters,
                                optionalStackParameters
                            )}
                            onChange={onOptionalInputChange}
                            disabled={disabled}
                        />
                    )
                )}
            </div>
        </div>
    )
})
