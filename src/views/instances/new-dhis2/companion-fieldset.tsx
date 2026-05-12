import { getIn } from 'final-form'
import { useEffect, useState, type FC } from 'react'
import { useForm } from 'react-final-form'
import { ParameterFieldset, type Dhis2StackName } from './parameter-fieldset.tsx'

type CompanionFieldsetProps = {
    stackId: Dhis2StackName
    displayName: string
    sourceStack: Dhis2StackName
    sourceField: string
    sourceValue: string
}

export const CompanionFieldset: FC<CompanionFieldsetProps> = ({ stackId, displayName, sourceStack, sourceField, sourceValue }) => {
    const form = useForm()
    const fieldPath = `${sourceStack}.${sourceField}`
    const [value, setValue] = useState(() => getIn(form.getState().values, fieldPath))

    useEffect(() => {
        return form.subscribe(
            ({ values }) => {
                setValue(getIn(values, fieldPath))
            },
            { values: true }
        )
    }, [form, fieldPath])

    if (value !== sourceValue) {
        return null
    }

    return <ParameterFieldset stackId={stackId} displayName={displayName} />
}
