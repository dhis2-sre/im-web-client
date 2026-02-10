import type { FC } from 'react'
import { useField } from 'react-final-form'
import { ParameterFieldset, type Dhis2StackName } from './parameter-fieldset.tsx'

type CompanionFieldsetProps = {
    stackId: Dhis2StackName
    displayName: string
    sourceStack: Dhis2StackName
    sourceField: string
    sourceValue: string
}

export const CompanionFieldset: FC<CompanionFieldsetProps> = ({ stackId, displayName, sourceStack, sourceField, sourceValue }) => {
    const {
        input: { value },
    } = useField(`${sourceStack}.${sourceField}`, {
        subscription: { value: true },
    })

    if (value !== sourceValue) {
        return null
    }

    return <ParameterFieldset stackId={stackId} displayName={displayName} />
}
