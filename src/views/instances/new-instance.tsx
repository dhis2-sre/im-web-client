import {
    Button,
    ButtonStrip,
    Card,
    Center,
    CircularLoader,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import { Stack } from '../../types'
import styles from './NewInstance.module.css'
import { StackConfigurator } from './stack-configurator'

export const NewInstance = () => {
    const navigate = useNavigate()
    const stackConfiguratorRef = useRef(null)
    const [selectedStack, setSelectedStack] = useState<Stack>({ name: '' })
    const [{ data: stacks, loading: stacksLoading, error: stacksError }] = useAuthAxios<Stack[]>('/stacks')
    const [{ response: postResponse, loading: postLoading, error: postError }, postNewInstance] = useAuthAxios(
        {
            url: 'instances',
            method: 'POST',
        },
        { manual: true }
    )
    const createInstance = useCallback(() => {
        postNewInstance({
            stackName: selectedStack.name,
            ...stackConfiguratorRef.current.getStackParameters(),
        })
    }, [postNewInstance, selectedStack])

    useEffect(() => {
        if (stacks) {
            setSelectedStack(stacks.find(({ name }) => name === 'dhis2'))
        }
    }, [stacks, setSelectedStack])

    if (postResponse?.status === 201) {
        return <Navigate to="/instances" />
    }

    if (stacksLoading || !selectedStack.name) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (stacksError) {
        return (
            <NoticeBox error title="Could not fetch the stacks">
                {stacksError.message}
            </NoticeBox>
        )
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
                        disabled={postLoading}
                    >
                        {stacks.map(({ name }) => (
                            <SingleSelectOption key={name} label={name} value={name} />
                        ))}
                    </SingleSelectField>
                    <h4 className={styles.subheader}>Stack configuration</h4>
                    <StackConfigurator name={selectedStack.name} ref={stackConfiguratorRef} disabled={postLoading} />
                    {postError && (
                        <NoticeBox error title="Save error" className={styles.error}>
                            An error occurred while saving the new instance
                        </NoticeBox>
                    )}
                    <ButtonStrip>
                        <Button primary disabled={postLoading} loading={postLoading} onClick={createInstance}>
                            Create instance
                        </Button>
                        <Button disabled={postLoading} onClick={() => navigate('/instances')}>
                            Cancel
                        </Button>
                    </ButtonStrip>
                </form>
            </Card>
        </>
    )
}
