import { SingleSelectField, SingleSelectOption, Card } from '@dhis2/ui'
import { getStacks } from '../api/stacks'
import { Stacks } from '../types/stack'
import { useApi } from '../api/useApi'
import { useEffect, useState } from 'react'
import { StackConfigurator } from './StackConfigurator'
import styles from './NewInstance.module.css'

export const NewInstance = () => {
    const { data: stacks, isLoading } = useApi<Stacks>(getStacks)
    const [selectedStack, setSelectedStack] = useState({ name: '' })

    useEffect(() => {
        if (stacks) {
            setSelectedStack(stacks.find(({ name }) => 'dhis2'))
        }
    }, [stacks, setSelectedStack])

    if (isLoading || !selectedStack.name) {
        return null
    }

    return (
        <>
            <h1 className={styles.header}>New instance</h1>
            <Card className={styles.container}>
                <SingleSelectField
                    className={styles.select}
                    selected={selectedStack?.name}
                    onChange={({ selected }) => {
                        setSelectedStack(
                            stacks.find(({ name }) => name === selected)
                        )
                    }}
                    label="Select a stack"
                >
                    {stacks.map(({ name }) => (
                        <SingleSelectOption
                            key={name}
                            label={name}
                            value={name}
                        />
                    ))}
                </SingleSelectField>
                <h4 className={styles.subheader}>Stack configuration</h4>
                <StackConfigurator name={selectedStack.name} />
            </Card>
        </>
    )
}
