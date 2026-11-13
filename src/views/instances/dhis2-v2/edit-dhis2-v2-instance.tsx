import { Card } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Page } from '../../../components/index.ts'
import { useDeploymentDetails, useDeploymentEdit } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import styles from '../styles.module.css'
import { initialValuesFor, useCompanionRemovalConfirm } from './companion-removal.tsx'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'

export const EditDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const deploymentId = parseInt(id!, 10)
    const [{ data: deployment, error }] = useDeploymentDetails()

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
    const saveEdit = useDeploymentEdit(STACK_ID, deploymentId, getIncludedParameters)
    const { submit, modal } = useCompanionRemovalConfirm(deployment, companions, saveEdit)

    const initialValues = useMemo(() => (deployment ? initialValuesFor(deployment) : undefined), [deployment])

    const navigateToDetails = useCallback(() => navigate(`/instances/${deploymentId}/details`), [navigate, deploymentId])

    /* The fetch is kicked off from an effect, so the first render has no deployment, no error and is
     * not yet loading. Anything other than an outright failure waits rather than reporting one. */
    if (!deployment) {
        return (
            <Page
                parent={{ label: 'Instances', to: '/instances' }}
                loading={!error}
                error={error ? { title: "Couldn't load the instance", description: error.message } : undefined}
            />
        )
    }

    return (
        <Page parent={{ label: 'Instances', to: '/instances' }} title={`Edit ${deployment.name ?? 'instance'}`}>
            <Card className={styles.container}>
                <Form onSubmit={submit} initialValues={initialValues} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <Dhis2V2Form handleSubmit={handleSubmit} handleCancel={navigateToDetails} mode="edit" deployment={deployment} />}
                </Form>
            </Card>
            {modal}
        </Page>
    )
}
