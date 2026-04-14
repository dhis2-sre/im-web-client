import { Button, ButtonStrip, Modal, ModalActions, ModalContent } from '@dhis2/ui'
import type { BaseButtonProps } from '@dhis2/ui'
import type { FC } from 'react'

type ConfirmationModalProps = {
    children: React.ReactNode
    destructive?: boolean
    onConfirm: BaseButtonProps['onClick']
    onCancel: BaseButtonProps['onClick']
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ children, destructive, onConfirm, onCancel }) => {
    // Modal's onClose is called with no args on Escape, and with ({}, event) on backdrop click.
    // Wrap to provide the (_, event) shape that onCancel expects.
    const handleClose = () => {
        const noop = () => {}
        onCancel?.({}, { stopPropagation: noop, preventDefault: noop } as unknown as React.MouseEvent<HTMLButtonElement>)
    }

    return (
        <Modal small onClose={handleClose}>
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
}
