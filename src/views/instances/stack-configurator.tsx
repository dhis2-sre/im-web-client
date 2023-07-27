import { Center, CheckboxField, CircularLoader, Divider, InputField, NoticeBox, SingleSelectField, SingleSelectOption, TextAreaField } from '@dhis2/ui'
import cx from 'classnames'
import type { Ref } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { Group, Stack, StackParameter } from '../../types'
import { IMAGE_REPOSITORY, IMAGE_TAG, ParameterField } from './parameter-field'
import styles from './stack-configurator.module.css'

type StackParameters = {
    name: string
    description: string
    groupName: string
    ttl: number
    public: boolean
    parameters: StackParameter[]
}

const toArray = (object) => Object.entries(object).map(([name, value]) => ({ name, value }))

const toKeyedObject = (array): StackParameter =>
    array.reduce((acc, { name, defaultValue: value }) => {
        acc[name] = value ?? ''
        return acc
    }, {})

const getRepositoryValueForImageTag = (name: string, parameters) => (name === IMAGE_TAG ? parameters[IMAGE_REPOSITORY] : undefined)

const computeNewParameters = (
    currentParameters: StackParameter,
    {
        name,
        value,
    }: {
        name: string
        value: string
    }
): StackParameter => {
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
            setStackParameters(toKeyedObject(stack.parameters.filter((parameter) => !parameter.consumed)))
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

    const onInputChange = (parameter) => {
        setStackParameters((currentParameters) => computeNewParameters(currentParameters, parameter))
    }

    return (
        <>
            <div className={styles.basics}>
                <InputField className={styles.field} label="Name" value={name} onChange={({ value }) => setName(value)} required disabled={disabled} />
                <TextAreaField className={styles.field} label="Description" value={description} rows={3} onChange={({ value }) => setDescription(value)} />
                <SingleSelectField className={styles.field} selected={group} filterable={true} onChange={({ selected }) => setGroup(selected)} label="Group">
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <SingleSelectField className={styles.field} selected={ttl} onChange={({ selected }) => setTtl(selected)} label="Lifetime">
                    {Array.from(ttlMap.keys()).map((key) => (
                        <SingleSelectOption key={key} label={key} value={key} />
                    ))}
                </SingleSelectField>
                <CheckboxField className={cx(styles.field, styles.checkboxfield)} label="Public?" checked={publicity} onChange={({ checked }) => setPublicity(checked)} />
            </div>
            <div>
                {stackParameters && (
                    <>
                        <Divider />
                        <h4 className={styles.subheader}>Parameters</h4>
                        {Object.entries(stackParameters).map(([name, value]: any) => (
                            <ParameterField
                                key={name}
                                name={name}
                                value={value}
                                repository={getRepositoryValueForImageTag(name, stackParameters)}
                                onChange={onInputChange}
                                required
                                disabled={disabled}
                            />
                        ))}
                    </>
                )}
            </div>
        </>
    )
})
