import {
    Center,
    CheckboxField,
    CircularLoader,
    Divider,
    InputField,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
    TextAreaField,
} from '@dhis2/ui'
import cx from 'classnames'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { Group, Stack } from '../../types'
import { IMAGE_REPOSITORY, IMAGE_TAG, ParameterField } from './parameter-field'
import styles from './stack-configurator.module.css'

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

const computeNewParameters = (
    currentParameters: ParameterRecord,
    { name, value }: { name: string; value: string }
): ParameterRecord => {
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

export const StackConfigurator = forwardRef(function StackConfigurator(
    { name: stackName, disabled }: { name: string; disabled: boolean },
    ref
) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [group, setGroup] = useState('')
    const [ttl, setTtl] = useState(defaultTTL)
    const [publicity, setPublicity] = useState(false)
    const [requiredStackParameters, setRequiredStackParameters] = useState({})
    const [optionalStackParameters, setOptionalStackParameters] = useState({})
    const [{ data: stack, loading: stackLoading, error: stackError }] = useAuthAxios<Stack>(`stacks/${stackName}`)
    const [{ data: groups, loading: groupsLoading, error: groupsError }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: 'groups',
        params: {
            deployable: true,
        },
    })

    useImperativeHandle(
        ref,
        () => ({
            getStackParameters() {
                return {
                    name: name,
                    description: description,
                    groupName: group,
                    ttl: ttlMap.get(ttl),
                    public: publicity,
                    requiredParameters: toArray(requiredStackParameters),
                    optionalParameters: toArray(optionalStackParameters),
                }
            },
        }),
        [name, description, group, ttl, requiredStackParameters, optionalStackParameters, publicity]
    )

    useEffect(() => {
        if (stack) {
            setRequiredStackParameters(
                toKeyedObject(stack.requiredParameters.filter((parameter) => !parameter.consumed))
            )
            setOptionalStackParameters(toKeyedObject(stack.optionalParameters))
        }
    }, [stack, setRequiredStackParameters, setOptionalStackParameters])

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

    if (stackError || groupsError)
        <NoticeBox error title="Could load the form">
            Could not fetch stack and/or groups
        </NoticeBox>

    const onRequiredInputChange = (parameter) => {
        setRequiredStackParameters((currentParameters) => computeNewParameters(currentParameters, parameter))
    }

    const onOptionalInputChange = (parameter) => {
        setOptionalStackParameters((currentParameters) => computeNewParameters(currentParameters, parameter))
    }

    return (
        <>
            <div className={styles.basics}>
                <InputField
                    className={styles.field}
                    label="Name"
                    value={name}
                    onChange={({ value }) => setName(value)}
                    required
                    disabled={disabled}
                />
                <TextAreaField
                    className={styles.field}
                    label="Description"
                    value={description}
                    rows={3}
                    onChange={({ value }) => setDescription(value)}
                />
                <SingleSelectField
                    className={styles.field}
                    selected={group}
                    filterable={true}
                    onChange={({ selected }) => setGroup(selected)}
                    label="Group"
                >
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <SingleSelectField
                    className={styles.field}
                    selected={ttl}
                    onChange={({ selected }) => setTtl(selected)}
                    label="Lifetime"
                >
                    {Array.from(ttlMap.keys()).map((key) => (
                        <SingleSelectOption key={key} label={key} value={key} />
                    ))}
                </SingleSelectField>
                <CheckboxField
                    className={cx(styles.field, styles.checkboxfield)}
                    label="Public?"
                    checked={publicity}
                    onChange={({ checked }) => setPublicity(checked)}
                />
            </div>

            {requiredStackParameters && (
                <>
                    <Divider />
                    <h4 className={styles.subheader}>Required parameters</h4>
                </>
            )}
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

            <Divider />
            <h4 className={styles.subheader}>Optional parameters</h4>
            <div className={styles.container}>
                {Object.entries(optionalStackParameters).map(([name, value]: any) => (
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
                ))}
            </div>
        </>
    )
})
