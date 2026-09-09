import { Card } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import { DEFAULT_TTL_SECONDS } from '../fields/ttl-presets.ts'
import styles from '../styles.module.css'
import { NewDhis2V2Form, STACK_ID } from './new-dhis2-v2-form.tsx'

export const NewDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
    const navigateToInstanceList = useCallback(() => {
        navigate('/instances')
    }, [navigate])

    const { groups, companions } = useGroupedStackParameters(STACK_ID)
    const getIncludedParameters = useCallback(
        (values: AnyObject) => {
            const stackValues: AnyObject = values[STACK_ID] ?? {}
            return groups
                .filter(({ group }) => !group.when || stackValues[group.when.parameter] === group.when.equals)
                .flatMap(({ parameters }) => parameters.map((parameter) => parameter.parameterName ?? ''))
        },
        [groups]
    )
    const { createDeployment, steps } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)

    return (
        <>
            <Heading title="Create a new DHIS2 Instance (v2)" />
            <Card className={styles.container}>
                <Form onSubmit={createDeployment} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS }}>
                    {({ handleSubmit, values }) => <NewDhis2V2Form handleCancel={navigateToInstanceList} handleSubmit={handleSubmit} name={values.name} steps={steps} />}
                </Form>
            </Card>
        </>
    )
}
