import { Card } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails, useDhis2DeploymentUpdate } from '../../../hooks/index.ts'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form.tsx'
import styles from './styles.module.css'

export const EditDhis2Instance: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const deploymentId = parseInt(id!, 10)
    const [{ data: deployment, loading, error }] = useDeploymentDetails()
    const updateDeployment = useDhis2DeploymentUpdate(deploymentId)

    const navigateToInstanceDetails = useCallback(() => {
        navigate(`/instances/${deploymentId}/details`)
    }, [navigate, deploymentId])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error || !deployment) {
        return <div>Error loading deployment</div>
    }

    const initialValues = {
        description: deployment.description || '',
        ttl: deployment.ttl,
    }

    return (
        <>
            <Heading title="Edit DHIS2 Core Instance" />
            <Card className={styles.container}>
                <Form onSubmit={updateDeployment} initialValues={initialValues} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <NewDhis2InstanceForm handleCancel={navigateToInstanceDetails} handleSubmit={handleSubmit} mode="update" />}
                </Form>
            </Card>
        </>
    )
}
