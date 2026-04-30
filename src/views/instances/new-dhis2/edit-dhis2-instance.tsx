import { Card, Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { FC, useCallback, useMemo } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails, useDhis2DeploymentUpdate, useDhis2StackParameters } from '../../../hooks/index.ts'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form.tsx'
import styles from './styles.module.css'

const isMaskedValue = (value: string) => value === '***' || /^\*+$/.test(value) || /^•+$/.test(value)

export const EditDhis2Instance: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const deploymentId = parseInt(id!, 10)
    const [{ data: deployment, loading, error }] = useDeploymentDetails()
    const submit = useDhis2DeploymentUpdate(deploymentId, deployment)

    const { consumedParameterNames: coreConsumed, loading: coreLoading } = useDhis2StackParameters('dhis2-core')
    const { consumedParameterNames: dbConsumed, loading: dbLoading } = useDhis2StackParameters('dhis2-db')
    const { consumedParameterNames: minioConsumed, loading: minioLoading } = useDhis2StackParameters('minio')
    const { consumedParameterNames: pgadminConsumed, loading: pgadminLoading } = useDhis2StackParameters('pgadmin')
    const stacksLoading = coreLoading || dbLoading || minioLoading || pgadminLoading

    const consumedByStack = useMemo<Record<string, string[]>>(
        () => ({
            'dhis2-core': coreConsumed,
            'dhis2-db': dbConsumed,
            minio: minioConsumed,
            pgadmin: pgadminConsumed,
        }),
        [coreConsumed, dbConsumed, minioConsumed, pgadminConsumed]
    )

    const initialValues = useMemo(() => {
        if (!deployment) {
            return undefined
        }
        const coreInstance = deployment.instances?.find((instance) => instance.stackName === 'dhis2-core')
        const perStack: Record<string, Record<string, string>> = {}
        for (const instance of deployment.instances ?? []) {
            if (!instance.stackName || !instance.parameters) {
                continue
            }
            const consumed = consumedByStack[instance.stackName] ?? []
            perStack[instance.stackName] = Object.fromEntries(
                Object.entries(instance.parameters)
                    .filter(([name]) => !consumed.includes(name))
                    .map(([name, parameter]) => {
                        const value = parameter.value ?? ''
                        return [name, isMaskedValue(value) ? '' : value]
                    })
            )
        }
        return {
            description: deployment.description ?? '',
            ttl: deployment.ttl,
            public: coreInstance?.public ?? false,
            ...perStack,
        }
    }, [deployment, consumedByStack])

    const navigateToDetails = useCallback(() => {
        navigate(`/instances/${deploymentId}/details`)
    }, [navigate, deploymentId])

    if (loading || stacksLoading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !deployment) {
        return (
            <NoticeBox error title="Could not load deployment">
                {error?.message}
            </NoticeBox>
        )
    }

    return (
        <>
            <Heading title={`Edit ${deployment.name ?? 'instance'}`} />
            <Card className={styles.container}>
                <Form onSubmit={(values) => submit(values, initialValues ?? {})} initialValues={initialValues} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <NewDhis2InstanceForm handleSubmit={handleSubmit} handleCancel={navigateToDetails} mode="update" deployment={deployment} />}
                </Form>
            </Card>
        </>
    )
}
