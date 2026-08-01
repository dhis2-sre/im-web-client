import { Card } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import styles from '../new-dhis2/styles.module.css'
import { NewDhis2V2Form, STACK_ID } from './new-dhis2-v2-form.tsx'

export const NewDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
    const navigateToInstanceList = useCallback(() => {
        navigate('/instances')
    }, [navigate])

    const { groups } = useGroupedStackParameters(STACK_ID)
    const getIncludedParameters = useCallback(
        (values: AnyObject) => {
            const stackValues: AnyObject = values[STACK_ID] ?? {}
            return groups
                .filter(({ group }) => !group.when || stackValues[group.when.parameter] === group.when.equals)
                .flatMap(({ parameters }) => parameters.map((parameter) => parameter.parameterName ?? ''))
        },
        [groups]
    )
    const createDeployment = useStackDeploymentCreation(STACK_ID, getIncludedParameters)

    return (
        <>
            <Heading title="Create a new DHIS2 Instance (v2)" />
            <Card className={styles.container}>
                <Form onSubmit={createDeployment} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <NewDhis2V2Form handleCancel={navigateToInstanceList} handleSubmit={handleSubmit} />}
                </Form>
            </Card>
        </>
    )
}
