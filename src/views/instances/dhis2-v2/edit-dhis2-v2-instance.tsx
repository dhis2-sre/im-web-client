import { Button, ButtonStrip, Card, Center, CircularLoader, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import type { AnyObject, FormApi } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails, useDeploymentEdit } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { Deployment, StackCompanion } from '../../../types/index.ts'
import styles from '../styles.module.css'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'

/* A read replaces every sensitive value with a run of stars, which is not a value anyone can submit.
 * Those fields start empty instead, and the form tells the user that leaving them so keeps what the
 * instance already holds. */
const isMaskedValue = (value: string) => /^[*•]+$/.test(value)

const initialValuesFor = (deployment: Deployment) => {
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

    const mainInstance = deployment.instances?.find((instance) => instance.stackName === STACK_ID)
    return {
        description: deployment.description ?? '',
        ttl: deployment.ttl,
        public: mainInstance?.public ?? false,
        ...perStack,
    }
}

/* The companions the deployment has now that the edit would leave it without. Removing one destroys
 * a running release, which is the one thing in this form worth stopping to confirm. */
const companionsBeingRemoved = (deployment: Deployment, companions: StackCompanion[], values: AnyObject) => {
    const stackValues: AnyObject = values[STACK_ID] ?? {}
    return companions
        .filter((companion) => deployment.instances?.some((instance) => instance.stackName === companion.name))
        .filter((companion) => companion.when && stackValues[companion.when.parameter] !== companion.when.equals)
        .map((companion) => companion.name)
}

export const EditDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const deploymentId = parseInt(id!, 10)
    const [{ data: deployment, loading, error }] = useDeploymentDetails()
    const [pendingRemoval, setPendingRemoval] = useState<{ names: string[]; confirm: () => void; cancel: () => void } | null>(null)

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

    const initialValues = useMemo(() => (deployment ? initialValuesFor(deployment) : undefined), [deployment])

    const navigateToDetails = useCallback(() => navigate(`/instances/${deploymentId}/details`), [navigate, deploymentId])

    const submit = useCallback(
        (values: AnyObject, form: FormApi) => {
            const dirtyFields = form.getState().dirtyFields
            const removing = deployment ? companionsBeingRemoved(deployment, companions, values) : []
            if (removing.length === 0) {
                return saveEdit(values, dirtyFields)
            }

            /* The submit stays open across the confirmation so the form knows it is still
             * submitting; backing out resolves it as a submit that did nothing. */
            return new Promise<AnyObject | undefined>((resolve) => {
                setPendingRemoval({
                    names: removing,
                    confirm: () => {
                        setPendingRemoval(null)
                        resolve(saveEdit(values, dirtyFields))
                    },
                    cancel: () => {
                        setPendingRemoval(null)
                        resolve(undefined)
                    },
                })
            })
        },
        [deployment, companions, saveEdit]
    )

    if (loading && !deployment) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !deployment) {
        return (
            <NoticeBox error title="Could not load instance">
                {error?.message}
            </NoticeBox>
        )
    }

    return (
        <>
            <Heading title={`Edit ${deployment.name ?? 'instance'}`} />
            <Card className={styles.container}>
                <Form onSubmit={submit} initialValues={initialValues} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => <Dhis2V2Form handleSubmit={handleSubmit} handleCancel={navigateToDetails} mode="edit" deployment={deployment} />}
                </Form>
            </Card>
            {pendingRemoval && (
                <Modal onClose={pendingRemoval.cancel}>
                    <ModalTitle>Remove {pendingRemoval.names.join(' and ')}?</ModalTitle>
                    <ModalContent>
                        Saving destroys {pendingRemoval.names.length > 1 ? 'these releases' : 'this release'} and everything{' '}
                        {pendingRemoval.names.length > 1 ? 'they hold' : 'it holds'}. This cannot be undone.
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button onClick={pendingRemoval.cancel}>Cancel</Button>
                            <Button destructive onClick={pendingRemoval.confirm}>
                                Save and remove
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </>
    )
}
