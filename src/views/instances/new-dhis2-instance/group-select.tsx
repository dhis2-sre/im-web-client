import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { useEffect, useMemo } from 'react'
import { useAuthAxios } from '../../../hooks'
import { Group } from '../../../types'
import { Field, useForm } from 'react-final-form'

export const GroupSelect = () => {
    const form = useForm()
    const [{ data: groups, loading, error }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    })
    const options = useMemo(() => (groups ?? []).map(({ name }) => ({ label: name, value: name })), [groups])

    useEffect(() => {
        const { value } = form.getFieldState('groupName')
        if (groups && groups.length > 0 && !value) {
            form.initialize((values) => ({ ...values, groupName: groups[0].name }))
        }
    }, [groups, form])

    return <Field required={loading} error={error} name="groupName" label="Group" component={SingleSelectFieldFF} options={options} validate={hasValue} />
}
