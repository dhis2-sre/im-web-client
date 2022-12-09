import axios from 'axios'
import { Divider, InputField, ButtonStrip, Button } from '@dhis2/ui'
import { getStack } from '../api/stacks'
import { Stack } from '../types/stack'
import { useApi } from '../api/useApi'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthHeader } from 'react-auth-kit'
import { API_HOST } from '../api'
import styles from './StackConfigurator.module.css'
import {StackParameter, StackParameterSourceId} from "./StackParameter";

const toTitleCase = (string) =>
    string
        .toLowerCase()
        .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())

const toKeyedObject = (array) =>
    array.reduce((acc, { Name: name, DefaultValue: defaultValue }) => {
        acc[name] = defaultValue ?? ''
        return acc
    }, {})

const toArray = (object) =>
    Object.entries(object).map(([name, value]) => ({ name, value }))

export const StackConfigurator = ({ name }) => {
    const navigate = useNavigate()
    const getAuthHeader = useAuthHeader()
    const [instanceName, setInstanceName] = useState('')
    const [sourceInstance, setSourceInstance] = useState(0)
    const [presetInstance, setPresetInstance] = useState(0)
    const [requiredStackParameters, setRequiredStackParameters] = useState({})
    const [optionalStackParameters, setOptionalStackParameters] = useState({})
    const {
        result: stack,
        isLoading,
        refetch,
    } = useApi<Stack>(getStack, { name })

    const createInstance = useCallback(() => {
        const authHeader = getAuthHeader()
        const data = {
            name: instanceName,
            groupName: 'whoami',
            stackName: name,
            requiredParameters: toArray(requiredStackParameters),
            optionalParameters: toArray(optionalStackParameters),
            presetInstance: presetInstance ,
            sourceInstance: sourceInstance,
        }
        axios({
            url: `${API_HOST}/instances`,
            method: 'post',
            headers: {
                Authorization: authHeader,
            },
            data,
        })
            .then(() => {
                navigate('/instances')
            })
            .catch((error) => {
                console.error(error)
            })
    }, [
        name,
        instanceName,
        presetInstance,
        sourceInstance,
        requiredStackParameters,
        optionalStackParameters,
        getAuthHeader,
        navigate,
    ])

    useEffect(() => {
        if (stack && stack.name !== name) {
            refetch()
        }
    }, [name, refetch, stack])

    useEffect(() => {
        if (stack) {
            setRequiredStackParameters(toKeyedObject(stack.requiredParameters))
            setOptionalStackParameters(toKeyedObject(stack.optionalParameters))
        }
    }, [stack, setRequiredStackParameters, setOptionalStackParameters])

    if (isLoading) {
        return null
    }

    const onRequiredInputChange = (key, value) => {
        if ('selected' in value) {
            value = value.selected
        } else {
            value = key.value
            key = key.name
        }

        setRequiredStackParameters({
            ...requiredStackParameters,
            [key]: value,
        })
    }

    const onOptionalInputChange = (key, value) => {
        if ('selected' in value) {
            value = value.selected
        } else {
                value = key.value
                key = key.name
        }

        setOptionalStackParameters({
            ...optionalStackParameters,
            [key]: value,
        })
    }

    return (
        <>
            <div className={styles.container}>
                <InputField
                    className={styles.field}
                    label="Name"
                    value={instanceName}
                    onChange={({ value }) => {
                        setInstanceName(value)
                    }}
                    required
                />
                <StackParameterSourceId
                    className={styles.field}
                    name="SOURCE_ID"
                    label="Source"
                    value="0"
                    onChange={(e) => {
                        setSourceInstance(e.selected)
                    }}
                />

                <StackParameter
                    className={styles.field}
                    name="PRESET_ID"
                    label="Preset"
                    value="0"
                    onChange={(e) => {
                        setPresetInstance(e.selected)
                    }}
                />

            </div>
            <Divider />
            <h4 className={styles.subheader}>Required parameters</h4>
            <div>
                {Object.entries(requiredStackParameters).map(
                    ([name, defaultValue]: any) => (
                        <StackParameter
                            className={styles.field}
                            name={name}
                            label={toTitleCase(name) + "*"}
                            value={defaultValue}
                            onChange={onRequiredInputChange}
                            required
                        />
                    )
                )}
            </div>
            <Divider />
            <h4 className={styles.subheader}>Optional parameters</h4>
            <div className={styles.container}>
                {Object.entries(optionalStackParameters).map(
                    ([name, defaultValue]: any) => (
                        <StackParameter
                            className={styles.field}
                            name={name}
                            label={toTitleCase(name)}
                            value={defaultValue}
                            onChange={onOptionalInputChange}
                        />
                    )
                )}
            </div>
            <br />
            <ButtonStrip>
                <Button primary onClick={createInstance}>
                    Create instance
                </Button>
                <Button onClick={() => navigate('/instances')}>Cancel</Button>
            </ButtonStrip>
        </>
    )
}
