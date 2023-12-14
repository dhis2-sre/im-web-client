import { Center, CheckboxField, CircularLoader, Divider, InputField, NoticeBox, SingleSelectField, SingleSelectOption, TextAreaField } from '@dhis2/ui'
import cx from 'classnames'
import type { Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useAuthAxios } from '../../../hooks'
import { Group, Stack, StackParameter } from '../../../types'
import { IMAGE_REPOSITORY, IMAGE_TAG, ParameterField } from './parameter-field'
import styles from './stack-configurator.module.css'
import fieldStyles from './parameter-field.module.css'

type StackParameters = {
    name: string
    description: string
    groupName: string
    ttl: number
    public: boolean
    parameters: StackParameter[]
}

type ParameterRecord = Record<string, { value: unknown; name: string }>

const toArray = (object: ParameterRecord) => Object.entries(object).map(([parameterName, value]) => ({ displayName: parameterName, value: value.value }))

const toKeyedObject = (array): StackParameter =>
    array.reduce((acc, { displayName, parameterName, defaultValue: value }) => {
        acc[parameterName] = {
            value: value ?? '',
            displayName,
        }
        return acc
    }, {})

const getRepositoryValueForImageTag = (parameterName: string, parameters) => {
    return parameterName === IMAGE_TAG ? parameters[IMAGE_REPOSITORY].value : undefined
}

const computeNewParameters = (currentParameters: StackParameters, parameterName: string, value: unknown): StackParameters => {
    /* `IMAGE_TAG` depends on `IMAGE_REPOSITORY` so
     * the `IMAGE_TAG` value needs to be cleared when
     * `IMAGE_REPOSITORY` changes.
     * Note: we can add more if clauses for dependent fields
     * here, but the current implementation does not support
     * interdependencies between optional and required parameters,
     * because it is called inside the setRequiredStackParameters
     * and setOptionalStackParameters callbacks. */
    if (parameterName === IMAGE_REPOSITORY && currentParameters[IMAGE_TAG]) {
        currentParameters[IMAGE_TAG].value = ''
    }

    return {
        ...currentParameters,
        [parameterName]: {
            displayName: currentParameters[parameterName].displayName,
            value,
        },
    }
}

const defaultTTL = '1 day'
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

type StackConfiguratorProps = { name: string; disabled: boolean }

export const StackConfigurator = forwardRef(function StackConfigurator(
    { name: stackName, disabled }: StackConfiguratorProps,
    ref: Ref<{
        getStackParameters
    }>
) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [group, setGroup] = useState('')
    const [ttl, setTtl] = useState(defaultTTL)
    const [publicity, setPublicity] = useState(false)
    const [stackParameters, setStackParameters] = useState({})
    const [{ data: stack, loading: stackLoading, error: stackError }] = useAuthAxios<Stack>(`stacks/${stackName}`)
    const [{ data: groups, loading: groupsLoading, error: groupsError }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    })

    useImperativeHandle(
        ref,
        () => ({
            getStackParameters(): StackParameters {
                return {
                    name: name,
                    description: description,
                    groupName: group,
                    ttl: ttlMap.get(ttl),
                    public: publicity,
                    parameters: toArray(stackParameters),
                }
            },
        }),
        [name, description, group, ttl, stackParameters, publicity]
    )

    useEffect(() => {
        if (stack) {
            const filtered = stack.parameters.filter((parameter) => !parameter.consumed).sort((a, b) => (a.priority < b.priority ? -1 : 1))
            setStackParameters(toKeyedObject(filtered))
        }
    }, [stack, setStackParameters])

    useEffect(() => {
        if (groups && groups.length > 0) {
            setGroup(groups[0].name)
        }
    }, [groups])

    if (stackLoading || groupsLoading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (stackError || groupsError) {
        return (
            <NoticeBox error title="Could load the form">
                Could not fetch stack and/or groups
            </NoticeBox>
        )
    }

    const onInputChange = ({ parameterName, value }) => {
        setStackParameters((currentParameters: StackParameters) => computeNewParameters(currentParameters, parameterName, value))
    }

    return (
        <>
            <div className={styles.container}>
                <InputField className={fieldStyles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={disabled} />
                <TextAreaField className={fieldStyles.field} label="Description" value={description} rows={3} onChange={({ value }) => setDescription(value)} />
                <SingleSelectField className={fieldStyles.field} selected={group} filterable={true} onChange={({ selected }) => setGroup(selected)} label="Group">
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <SingleSelectField className={fieldStyles.field} selected={ttl} onChange={({ selected }) => setTtl(selected)} label="Lifetime">
                    {Array.from(ttlMap.keys()).map((key) => (
                        <SingleSelectOption key={key} label={key} value={key} />
                    ))}
                </SingleSelectField>
                <CheckboxField className={cx(fieldStyles.field, fieldStyles.checkboxfield)} label="Public?" checked={publicity} onChange={({ checked }) => setPublicity(checked)} />
            </div>
            {stackParameters && (
                <>
                    <Divider />
                    <h4 className={styles.subheader}>Parameters</h4>
                    <div className={styles.container}>
                        {Object.entries(stackParameters).map(([parameterName, { value, displayName }]: any) => (
                            <ParameterField
                                key={displayName}
                                displayName={displayName}
                                parameterName={parameterName}
                                value={value}
                                repository={getRepositoryValueForImageTag(parameterName, stackParameters)}
                                onChange={onInputChange}
                                required
                                disabled={disabled}
                            />
                        ))}
                    </div>
                </>
            )}
        </>
    )
})
