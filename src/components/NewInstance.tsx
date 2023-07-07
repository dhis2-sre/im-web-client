import { Button, ButtonStrip, Card, NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import axios from 'axios'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthHeader } from 'react-auth-kit'
import { API_URL } from '../api'
import { getStacks } from '../api/stacks'
import { useApi } from '../api/useApi'
import { Stacks } from '../types/stack'
import { StackConfigurator } from './StackConfigurator'
import styles from './NewInstance.module.css'

const postReducer = (
    state: {
        isPosting: boolean
        postSuccess: boolean
        postError: null | Error
    },
    action: {
        type: 'POST_INIT' | 'POST_SUCCESS' | 'POST_ERROR'
        payload?: any
    }
) => {
    switch (action.type) {
        case 'POST_INIT':
            return {
                isPosting: true,
                postSuccess: false,
                postError: null,
            }
        case 'POST_SUCCESS':
            return {
                isPosting: false,
                postSuccess: true,
                postError: null,
            }
        case 'POST_ERROR':
            return {
                isPosting: false,
                postSuccess: false,
                postError: action.payload,
            }
        default:
            return state
    }
}

export const NewInstance = () => {
    const stackConfiguratorRef = useRef(null)
    const getAuthHeader = useAuthHeader()
    const navigate = useNavigate()
    const { data: stacks, isLoading } = useApi<Stacks>(getStacks)
    const [selectedStack, setSelectedStack] = useState({ name: '' })
    const [{ isPosting, postSuccess, postError }, dispatch] = useReducer(postReducer, {
        isPosting: false,
        postSuccess: false,
        postError: null,
    })

    const createInstance = useCallback(() => {
        dispatch({ type: 'POST_INIT' })
        const authHeader = getAuthHeader()
        const data = {
            stackName: selectedStack.name,
            ...stackConfiguratorRef.current.getStackParameters(),
        }
        axios({
            url: `${API_URL}/instances`,
            method: 'post',
            headers: {
                Authorization: authHeader,
            },
            data,
        })
            .then(() => {
                dispatch({ type: 'POST_SUCCESS' })
            })
            .catch((error) => {
                console.error(error)
                dispatch({ type: 'POST_ERROR', payload: error })
            })
    }, [getAuthHeader, selectedStack])

    useEffect(() => {
        if (stacks) {
            setSelectedStack(stacks.find(({ name }) => name === 'dhis2'))
        }
    }, [stacks, setSelectedStack])

    if (postSuccess) {
        return <Navigate to="/instances" />
    }

    if (isLoading || !selectedStack.name) {
        return null
    }

    return (
        <>
            <h1 className={styles.header}>New instance</h1>
            <Card className={styles.container}>
                <form onSubmit={createInstance}>
                    <SingleSelectField
                        className={styles.select}
                        selected={selectedStack?.name}
                        onChange={({ selected }) => {
                            setSelectedStack(stacks.find(({ name }) => name === selected))
                        }}
                        label="Select a stack"
                        disabled={isPosting}
                    >
                        {stacks.map(({ name }) => (
                            <SingleSelectOption key={name} label={name} value={name} />
                        ))}
                    </SingleSelectField>
                    <h4 className={styles.subheader}>Stack configuration</h4>
                    <StackConfigurator name={selectedStack.name} ref={stackConfiguratorRef} disabled={isPosting} />
                    {postError && (
                        <NoticeBox error title="Save error" className={styles.error}>
                            An error occurred while saving the new instance
                        </NoticeBox>
                    )}
                    <ButtonStrip>
                        <Button primary disabled={isPosting} loading={isPosting} onClick={createInstance}>
                            Create instance
                        </Button>
                        <Button disabled={isPosting} onClick={() => navigate('/instances')}>
                            Cancel
                        </Button>
                    </ButtonStrip>
                </form>
            </Card>
        </>
    )
}
