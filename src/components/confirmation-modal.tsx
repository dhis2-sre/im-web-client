import {
  BaseButtonProps,
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
} from '@dhis2/ui'
import type { FC } from 'react'

type ConfirmationModalProps = {
    children: React.ReactNode
    destructive?: boolean
    onConfirm: BaseButtonProps['onClick']
    onCancel: BaseButtonProps['onClick']
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ children, destructive, onConfirm, onCancel }) => (
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
