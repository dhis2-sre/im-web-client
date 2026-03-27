import { Card, Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDhis2DeploymentUpdate, useDeploymentDetails, useAuthAxios } from '../../../hooks/index.ts'
import { Group } from '../../../types/index.ts'
import { UpdateDhis2InstanceForm } from './update-dhis2-instance-form.tsx'
import styles from './styles.module.css'

export const UpdateDhis2Instance: FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const navigateToInstanceDetails = useCallback(() => {
        navigate(`/instances/${id}/details`)
    }, [navigate, id])
    const updateDeployment = useDhis2DeploymentUpdate()
    const [{ data: deployment, error: deploymentError, loading: deploymentLoading }] = useDeploymentDetails()

    const [groups, setGroups] = useState<Group[]>([])
    const [{ error: groupsError, loading: groupsLoading }, fetchGroups] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
        params: {
            deployable: true,
        },
    }, { manual: true })

    const [, fetchGroup] = useAuthAxios<Group>({
        method: 'GET',
    }, { manual: true })

    useEffect(() => {
        const loadGroups = async () => {
            const deployableGroupsResult = await fetchGroups()
            let allGroups = deployableGroupsResult.data || []

            if (deployment && deployment.groupName && !allGroups.find(group => group.name === deployment.groupName)) {
                const deploymentGroupResult = await fetchGroup({ url: `/groups/${deployment.groupName}` })
                if (deploymentGroupResult.data) {
                    allGroups = [...allGroups, deploymentGroupResult.data]
                }
            }
            setGroups(allGroups)
        }
        loadGroups()
    }, [deployment, fetchGroups, fetchGroup])

    const handleSubmit = useCallback(async (values: any) => {
        return updateDeployment(id!, values)
    }, [updateDeployment, id])

    const loading = deploymentLoading || groupsLoading
    const error = deploymentError || groupsError

    if (loading) {
        return (
            <Center className={styles.loaderWrap}>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !deployment) {
        return (
            <NoticeBox error title="Could not load instance details">
                {error?.message || 'Details not found'}
            </NoticeBox>
        )
    }

    const coreInstance = deployment.instances?.find(
        (instance) => instance.stackName === 'dhis2-core'
    )

    const initialValues = {
        name: deployment.name,
        description: deployment.description,
        public: coreInstance?.public,
        ttl: deployment.ttl,
        groupName: deployment.groupName,
    }

    return (
        <>
            <Heading title="Update DHIS2 Core Instance" />
            <Card className={styles.container}>
                <Form onSubmit={handleSubmit} keepDirtyOnReinitialize initialValues={initialValues}>
                    {({ handleSubmit }) => <UpdateDhis2InstanceForm handleCancel={navigateToInstanceDetails} handleSubmit={handleSubmit} groups={groups} />}
                </Form>
            </Card>
        </>
    )
}
