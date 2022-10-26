import axios from 'axios'
import { InputField, Button } from '@dhis2/ui'
import { getStack } from '../api/stacks'
import { Stack } from '../types/stack'
import { useApi } from '../api/useApi'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthHeader } from 'react-auth-kit'
import { IM_HOST } from '../api'

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
            requiredStackParameters: toArray(requiredStackParameters),
            optionalStackParameters: toArray(optionalStackParameters),
        }
        axios({
            url: `${IM_HOST}/instances`,
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

    const onRequiredInputChange = ({ name, value }) => {
        setRequiredStackParameters({
            ...requiredStackParameters,
            [name]: value,
        })
    }

    const onOptionalInputChange = ({ name, value }) => {
        setOptionalStackParameters({
            ...optionalStackParameters,
            [name]: value,
        })
    }

    return (
        <>
            <InputField
                label="Name"
                value={instanceName}
                onChange={({ value }) => setInstanceName(value)}
                required
            />
            {Object.entries(requiredStackParameters).map(
                ([name, defaultValue]: any) => (
                    <InputField
                        key={name}
                        name={name}
                        label={toTitleCase(name)}
                        value={defaultValue}
                        onChange={onRequiredInputChange}
                        required
                    />
                )
            )}
            {Object.entries(optionalStackParameters).map(
                ([name, defaultValue]: any) => (
                    <InputField
                        key={name}
                        name={name}
                        label={toTitleCase(name)}
                        value={defaultValue}
                        onChange={onOptionalInputChange}
                    />
                )
            )}
            <Button primary onClick={createInstance}>
                Create instance
            </Button>
        </>
    )
}
