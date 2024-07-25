import { Card } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDhis2DeploymentCreation } from '../../../hooks/index.ts'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form.tsx'
import styles from './styles.module.css'

export const NewDhis2Instance: FC = () => {
    const navigate = useNavigate()
    const navigateToInstanceList = useCallback(() => {
        navigate('/instances')
    }, [navigate])
    const createDeployment = useDhis2DeploymentCreation({ onComplete: navigateToInstanceList })

    return (
        <>
            <Heading title="Create a new DHIS2 Core Instance" />
            <Card className={styles.container}>
                <Form onSubmit={createDeployment} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <NewDhis2InstanceForm handleCancel={navigateToInstanceList} handleSubmit={handleSubmit} />}
                </Form>
            </Card>
        </>
    )
}
