import { hasValue, SingleSelectFieldFF } from '@dhis2/ui'
import { useEffect, useMemo, useState } from 'react'
import { Field, useForm } from 'react-final-form'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { Group } from '../../../../types/index.ts'
import styles from './fields.module.css'
import { GroupSelectHelpText } from './group-select-help-text.tsx'

export const GroupSelect = () => {
    const form = useForm()
    const [currentGroup, setCurrentGroup] = useState()

    const [{ data: groups, loading, error }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    })

    const options = useMemo(() => (groups ?? []).map(({ name }) => ({ label: name, value: name })), [groups])

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
            className={styles.field}
            required={loading}
            error={error}
            name="groupName"
            label="Group"
            component={SingleSelectFieldFF}
            options={options}
            helpText={<GroupSelectHelpText groupName={currentGroup} />}
            validate={hasValue}
        />
    )
}
