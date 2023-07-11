import { Button, ButtonStrip, Modal, ModalActions, ModalContent } from '@dhis2/ui'

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
                    Cancel
                </Button>
                <Button primary={!destructive} destructive={destructive} onClick={onConfirm}>
                    Confirm
                </Button>
            </ButtonStrip>
        </ModalActions>
    </Modal>
)
