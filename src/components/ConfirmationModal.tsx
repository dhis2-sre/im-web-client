import { Modal, ModalContent, ModalActions, ButtonStrip, Button } from '@dhis2/ui'

type ConfirmationModalProps = {
    children: React.ReactNode
    destructive?: boolean
    onConfirm: Function
    onCancel: Function
}

export const ConfirmationModal = ({ children, destructive, onConfirm, onCancel }: ConfirmationModalProps) => (
    <Modal small>
        <ModalContent>{children}</ModalContent>
        <ModalActions>
            <ButtonStrip end>
                <Button onClick={onCancel} secondary>
                    Secondary action
                </Button>
                <Button destructive={destructive} onClick={onConfirm}>
                    Primary action
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)
