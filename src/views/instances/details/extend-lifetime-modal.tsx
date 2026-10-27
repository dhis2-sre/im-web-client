import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import { FORM_ERROR } from 'final-form'
import type { FC } from 'react'
import { Form } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'
import { refusalMessage } from '../../../utils/deploy-state.ts'
import { ExtendTtlSelect } from '../fields/extend-ttl-select.tsx'

/* The Lifetime field of the edit form on its own. A PATCH carrying only a ttl touches nothing on the
 * cluster, so this finishes without a redeploy. */
export const ExtendLifetimeModal: FC<{ deployment: Deployment; onClose: () => void; onExtended: () => void }> = ({ deployment, onClose, onExtended }) => {
    const [, patch] = useAuthAxios({ url: `/deployments/${deployment.id}`, method: 'PATCH' }, { manual: true })

    const submit = async ({ ttl }: { ttl: number }) => {
        try {
            await patch({ data: { ttl } })
            onExtended()
            onClose()
            return undefined
        } catch (error) {
            return { [FORM_ERROR]: refusalMessage(error, 'Could not extend the lifetime') }
        }
    }

    return (
        <Form onSubmit={submit} initialValues={{ ttl: deployment.ttl }}>
            {({ handleSubmit, pristine, invalid, submitting, submitError }) => (
                <Modal onClose={onClose} position="middle">
                    <ModalTitle>Extend lifetime of {deployment.name}</ModalTitle>
                    <ModalContent>
                        <ExtendTtlSelect deployment={deployment} />
                        {submitError && (
                            <NoticeBox error title="Could not extend the lifetime">
                                {submitError}
                            </NoticeBox>
                        )}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button secondary onClick={onClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button primary onClick={() => void handleSubmit()} disabled={pristine || invalid} loading={submitting}>
                                Extend
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </Form>
    )
}
