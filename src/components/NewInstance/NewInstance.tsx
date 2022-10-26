import { SingleSelectField, SingleSelectOption, Card } from '@dhis2/ui'
import { getStacks } from '../../api/stacks'
import { Stacks } from '../../types/stack'
import { useApi } from '../../api/useApi'
import { useEffect, useState } from 'react'
import { StackConfigurator } from './StackConfigurator'

export const NewInstance = () => {
    const { result: stacks, isLoading } = useApi<Stacks>(getStacks)
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
        <Card>
            <SingleSelectField
                selected={selectedStack?.name}
                onChange={({ selected }) => {
                    setSelectedStack(
                        stacks.find(({ name }) => name === selected)
                    )
                }}
                label="Select a stack"
            >
                {stacks.map(({ name }) => (
                    <SingleSelectOption key={name} label={name} value={name} />
                ))}
            </SingleSelectField>
            <StackConfigurator name={selectedStack.name} />
        </Card>
    )
}
