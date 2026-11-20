import { hasValue, SingleSelectFieldFF } from '@dhis2/ui'
import { useEffect, useMemo, useState } from 'react'
import { Field, useForm } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Group } from '../../../types/index.ts'
import { useGroupSelectHelpText } from './group-select-help-text.tsx'

export const GroupSelect = () => {
    const form = useForm()
    const [currentGroup, setCurrentGroup] = useState<string | undefined>(() => form.getState().values.groupName)

    const [{ data: groups, loading, error }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    })

    /* A form opened on a preset already has its group, which the select must offer before the groups
     * arrive, and keeps offering if it isn't one the user can deploy to. */
    const options = useMemo(() => {
        const names = (groups ?? []).map(({ name }) => name)
        return (currentGroup && !names.includes(currentGroup) ? [...names, currentGroup] : names).map((name) => ({ label: name, value: name }))
    }, [groups, currentGroup])
    const helpText = useGroupSelectHelpText(currentGroup)

    useEffect(() => {
        return form.subscribe(
            ({ values }) => {
                setCurrentGroup(values.groupName)
            },
            { values: true }
        )
    }, [form])

    useEffect(() => {
        const { value } = form.getFieldState('groupName')
        if (groups && groups.length > 0 && !value) {
            form.initialize((values) => ({ ...values, groupName: groups[0].name }))
        }
    }, [groups, form])

    return (
        <Field
            filterable={options.length > 7}
            required
            loading={loading}
            error={error}
            name="groupName"
            label="Group"
            component={SingleSelectFieldFF}
            options={options}
            helpText={helpText}
            validate={hasValue}
        />
    )
}
