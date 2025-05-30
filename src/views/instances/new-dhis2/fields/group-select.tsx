import { Center, CircularLoader, hasValue, SingleSelectFieldFF } from '@dhis2/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import { useAuthAxios } from '../../../../hooks/index.ts'
import { ClusterResources, Group } from '../../../../types/index.ts'
import styles from './fields.module.css'

export const GroupSelect = () => {
    const form = useForm()
    const { values } = useFormState()
    const groupNameValue = values.groupName
    const [resources, setResources] = useState<ClusterResources>({})
    const [resourcesString, setResourcesString] = useState<string>('')
    const [{ loading: clusterResourcesLoading, error: clusterResourcesError }, fetchClusterResources] = useAuthAxios<ClusterResources>(
        {
            method: 'GET',
        },
        { manual: true, autoCatch: true }
    )

    const fetchClusterResourcesCallback = useCallback(async () => {
        const { data } = await fetchClusterResources(`/groups/${groupNameValue}/resources`)
        setResources(data)
    }, [fetchClusterResources, groupNameValue])

    useEffect(() => {
        try {
            void fetchClusterResourcesCallback()
        } catch (e) {
            console.error(e)
        }
    }, [fetchClusterResourcesCallback, groupNameValue])

    useEffect(() => {
        const resourcesStr = `CPU ${resources.CPU}, Memory ${resources.Memory}${resources.Autoscaled ? ', autoscaled' : ''}`
        setResourcesString(resourcesStr)
    }, [resources])

    const [{ data: groups, loading, error }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    })

    const helpText = useMemo(() => {
        if (clusterResourcesError) {
            return `Error fetching cluster resources: ${clusterResourcesError.message}`
        }
        if (clusterResourcesLoading) {
            return (
                <Center>
                    <CircularLoader />
                </Center>
            )
        }
        return resourcesString
    }, [clusterResourcesError, clusterResourcesLoading, resourcesString])

    const options = useMemo(() => (groups ?? []).map(({ name }) => ({ label: name, value: name })), [groups])

    useEffect(() => {
        const { value } = form.getFieldState('groupName')
        if (groups && groups.length > 0 && !value) {
            form.initialize((values) => ({ ...values, groupName: groups[0].name }))
        }
    }, [groups, form])

    return (
        <>
            <Field
                filterable={options.length > 7}
                className={styles.field}
                required={loading}
                error={error}
                name="groupName"
                label="Group"
                component={SingleSelectFieldFF}
                options={options}
                helpText={helpText}
                validate={hasValue}
            />
        </>
    )
}
