import { Card, Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { FC, useCallback, useMemo } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails, useDhis2DeploymentUpdate } from '../../../hooks/index.ts'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form.tsx'
import styles from './styles.module.css'

const isMaskedValue = (value: string) => /^[*•]+$/.test(value)

export const EditDhis2Instance: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const deploymentId = parseInt(id!, 10)
    const [{ data: deployment, loading, error }] = useDeploymentDetails()
    const submit = useDhis2DeploymentUpdate(deploymentId, deployment)

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
            perStack[instance.stackName] = Object.fromEntries(
                Object.entries(instance.parameters).map(([name, parameter]) => {
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
    }, [deployment])

    const navigateToDetails = useCallback(() => {
        navigate(`/instances/${deploymentId}/details`)
    }, [navigate, deploymentId])

    if (loading) {
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
                <Form onSubmit={(values, form) => submit(values, form.getState().dirtyFields)} initialValues={initialValues} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <NewDhis2InstanceForm handleSubmit={handleSubmit} handleCancel={navigateToDetails} mode="update" deployment={deployment} />}
                </Form>
            </Card>
        </>
    )
}
