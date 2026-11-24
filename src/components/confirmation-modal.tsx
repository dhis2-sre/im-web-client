import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { FC } from 'react'

type ConfirmationModalProps = {
    children: React.ReactNode
    /* The question being asked, naming what it acts on, such as "Delete malaria-demo?". */
    title: string
    /* The action on the confirm button, such as Delete instance or Restart, so it says what clicking it does. */
    confirmLabel: string
    /* The way out, when "Cancel" would read as cancelling something else, such as Keep editing. */
    cancelLabel?: string
    destructive?: boolean
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ children, title, confirmLabel, cancelLabel = 'Cancel', destructive, onConfirm, onCancel }) => (
    <Modal small onClose={onCancel}>
        <ModalTitle>{title}</ModalTitle>
        <ModalContent>{children}</ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button onClick={onCancel} secondary>
                    {cancelLabel}
                </Button>
                <Button primary={!destructive} destructive={destructive} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)
