import type { FC } from 'react'
import { useField } from 'react-final-form'
import { ParameterFieldset, type Dhis2StackName } from './parameter-fieldset.tsx'

type CompanionFieldsetProps = {
    stackId: Dhis2StackName
    displayName: string
    sourceField: string
    sourceValue: string
}

export const CompanionFieldset: FC<CompanionFieldsetProps> = ({ stackId, displayName, sourceField, sourceValue }) => {
    const {
        input: { value },
    } = useField(`dhis2-core.${sourceField}`, {
        subscription: { value: true },
    })

    if (value !== sourceValue) {
        return null
    }

    return <ParameterFieldset stackId={stackId} displayName={displayName} />
}
