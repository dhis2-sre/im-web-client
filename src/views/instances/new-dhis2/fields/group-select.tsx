import { hasValue, SingleSelectFieldFF } from '@dhis2/ui'
import { useEffect, useMemo, useState } from 'react'
import { Field, useForm } from 'react-final-form'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { Group } from '../../../../types/index.ts'
import styles from './fields.module.css'
import { GroupSelectHelpText } from './group-select-help-text.tsx'

export const GroupSelect = ({ groups: propGroups }: { groups?: Group[] }) => {
    const form = useForm()
    const [{ data: fetchedGroups, loading, error }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    }, { manual: !!propGroups })

    const groups = propGroups ?? fetchedGroups

    const options = useMemo(() => (groups ?? []).map(({ name }) => ({ label: name, value: name })), [groups])

    const [currentGroup, setCurrentGroup] = useState()

    useEffect(() => {
        if (!propGroups) {
            const { value } = form.getFieldState('groupName')
            if (groups && groups.length > 0 && !value) {
                form.initialize((values) => ({ ...values, groupName: groups[0].name }))
            }
        }
    }, [groups, form, propGroups])

    useEffect(() => {
        if (!propGroups) {
            return form.subscribe(
                ({ values }) => {
                    setCurrentGroup(values.groupName)
                },
                { values: true }
            )
        }
    }, [form, propGroups])

    return (
        <Field
            filterable={options.length > 7}
            className={styles.field}
            required={!propGroups && loading}
            error={!propGroups && error}
            name="groupName"
            label="Group"
            component={SingleSelectFieldFF}
            options={options}
            helpText={!propGroups ? <GroupSelectHelpText groupName={currentGroup} /> : undefined}
            validate={hasValue}
        />
    )
}
