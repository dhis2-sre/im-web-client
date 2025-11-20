import { Card } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails, useDhis2DeploymentUpdate } from '../../../hooks/index.ts'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form.tsx'
import styles from './styles.module.css'

const isMaskedValue = (value: string): boolean => {
    return value === '***' || value === '••••' || /^\*+$/.test(value) || /^•+$/.test(value)
}

export const EditDhis2Instance: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const deploymentId = parseInt(id!, 10)
    const [{ data: deployment, loading, error }] = useDeploymentDetails()
    const updateDeployment = useDhis2DeploymentUpdate(deploymentId, deployment)

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
        public: deployment.instances?.find((inst) => inst.stackName === 'dhis2-core')?.public || false,
        ...deployment.instances?.reduce(
            (acc, instance) => {
                if (instance.parameters) {
                    acc[instance.stackName] = Object.entries(instance.parameters).reduce(
                        (params, [key, param]) => {
                            // Treat masked sensitive values as empty
                            const value = param.value || ''
                            params[key] = isMaskedValue(value) ? '' : value
                            return params
                        },
                        {} as Record<string, string>
                    )
                }
                return acc
            },
            {} as Record<string, Record<string, string>>
        ),
    }

    const headingTitle = deployment.name ? `Edit ${deployment.name}` : 'Edit instance'

    return (
        <>
            <Heading title={headingTitle} />
            <Card className={styles.container}>
                <Form onSubmit={updateDeployment} initialValues={initialValues} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <NewDhis2InstanceForm handleCancel={navigateToInstanceDetails} handleSubmit={handleSubmit} mode="update" deployment={deployment} />}
                </Form>
            </Card>
        </>
    )
}
