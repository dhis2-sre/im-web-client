import { Divider, InputField, TextArea, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { getStack } from '../api/stacks'
import { Stack } from '../types/stack'
import { useApi } from '../api/useApi'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import styles from './StackConfigurator.module.css'
import { IMAGE_REPOSITORY, IMAGE_TAG, ParameterField } from './ParameterField'
import { Group } from '../types'
import { getGroups } from '../api'

// type ParameterRecord = Record<ParameterName, string>
type ParameterRecord = any

const toArray = (object) => Object.entries(object).map(([name, value]) => ({ name, value }))

const toKeyedObject = (array): ParameterRecord =>
    array.reduce((acc, { name, defaultValue: value }) => {
        acc[name] = value ?? ''
        return acc
    }, {})

const getRepositoryValueForImageTag = (name: string, requiredParameters, optionalParameters) =>
    name === IMAGE_TAG ? requiredParameters[IMAGE_REPOSITORY] ?? optionalParameters[IMAGE_REPOSITORY] : undefined

const computeNewParameters = (currentParameters: ParameterRecord, { name, value }: { name: string; value: string }): ParameterRecord => {
    /* `IMAGE_TAG` depends on `IMAGE_REPOSITORY` so
     * the `IMAGE_TAG` value needs to be cleared when
     * `IMAGE_REPOSITORY` changes.
     * Note: we can add more if clauses for dependent fields
     * here, but the current implementation does not support
     * interdependencies between optional and required parameters,
     * because it is called inside the setRequiredStackParameters
     * and setOptionalStackParameters callbacks. */
    if (name === IMAGE_REPOSITORY && currentParameters[IMAGE_TAG]) {
        currentParameters[IMAGE_TAG] = ''
    }

    return {
        ...currentParameters,
        [name]: value,
    }
}

const ttlMap = new Map<string, number>([
    ['1 hour', 60 * 60],
    ['6 hours', 60 * 60 * 6],
    ['12 hours', 60 * 60 * 12],
    ['1 day', 60 * 60 * 24],
    ['2 days', 60 * 60 * 24 * 2],
    ['5 days', 60 * 60 * 24 * 5],
    ['1 week', 60 * 60 * 24 * 7],
    ['2 weeks', 60 * 60 * 24 * 7 * 2],
    ['1 month', 60 * 60 * 24 * 7 * 4],
])

export const StackConfigurator = forwardRef(function StackConfigurator({ stackName, disabled }: { stackName: string; disabled: boolean }, ref) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [requiredStackParameters, setRequiredStackParameters] = useState({})
    const [optionalStackParameters, setOptionalStackParameters] = useState({})
    const { data: stack, isLoading, isFetching, refetch } = useApi<Stack>(getStack, stackName)
    const { data: groups, isLoading: isLoadingGroups } = useApi<Group[]>(getGroups)
    const [group, setGroup] = useState('')
    const [ttl, setTtl] = useState('')

    useImperativeHandle(
        ref,
        () => ({
            getStackParameters() {
                return {
                    name: name,
                    description: description,
                    groupName: group,
                    ttl: ttlMap.get(ttl),
                    requiredParameters: toArray(requiredStackParameters),
                    optionalParameters: toArray(optionalStackParameters),
                }
            },
        }),
        [name, description, group, ttl, requiredStackParameters, optionalStackParameters]
    )

    useEffect(() => {
        if (!isFetching && stack && stack.name !== name) {
            refetch()
        }
    }, [name, refetch, stack, isFetching])

    useEffect(() => {
        if (stack) {
            setRequiredStackParameters(toKeyedObject(stack.requiredParameters.filter((parameter) => !parameter.consumed)))
            setOptionalStackParameters(toKeyedObject(stack.optionalParameters))
        }
    }, [stack, setRequiredStackParameters, setOptionalStackParameters])

    if (isLoading || isLoadingGroups) {
        return null
    }

    const onRequiredInputChange = (parameter) => {
        setRequiredStackParameters((currentParameters) => computeNewParameters(currentParameters, parameter))
    }

    const onOptionalInputChange = (parameter) => {
        setOptionalStackParameters((currentParameters) => computeNewParameters(currentParameters, parameter))
    }

    return (
        <div>
            <div className={styles.container}>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={disabled} />
                <TextArea value={description} onChange={({ value }) => setDescription(value)}></TextArea>
                <SingleSelectField className={styles.select} selected={group} filterable={true} onChange={({ selected }) => setGroup(selected)} label="Group">
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <SingleSelectField className={styles.select} selected={ttl} onChange={({ selected }) => setTtl(selected)} label="Lifetime">
                    {Array.from(ttlMap.keys()).map((key) => (
                        <SingleSelectOption key={key} label={key} value={key} />
                    ))}
                </SingleSelectField>

                {Object.entries(requiredStackParameters).map(([name, value]: any) => (
                    <ParameterField
                        key={name}
                        name={name}
                        value={value}
                        repository={getRepositoryValueForImageTag(name, requiredStackParameters, optionalStackParameters)}
                        onChange={onRequiredInputChange}
                        required
                        disabled={disabled}
                    />
                ))}
            </div>
            <Divider />
            <h4 className={styles.subheader}>Optional parameters</h4>
            <div className={styles.container}>
                {Object.entries(optionalStackParameters).map(([name, value]: any) => (
                    <ParameterField
                        key={name}
                        name={name}
                        value={value}
                        repository={getRepositoryValueForImageTag(name, requiredStackParameters, optionalStackParameters)}
                        onChange={onOptionalInputChange}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    )
})
