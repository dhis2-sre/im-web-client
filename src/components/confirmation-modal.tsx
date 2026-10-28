import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { BaseButtonProps } from '@dhis2/ui'
import type { FC } from 'react'

type ConfirmationModalProps = {
    children: React.ReactNode
    title?: string
    /* The verb on the confirm button, such as Delete or Restart, so it says what clicking it does. */
    confirmLabel?: string
    destructive?: boolean
    onConfirm: BaseButtonProps['onClick']
    onCancel: BaseButtonProps['onClick']
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({ children, title, confirmLabel = 'Confirm', destructive, onConfirm, onCancel }) => {
    // Modal's onClose is called with no args on Escape, and with ({}, event) on backdrop click.
    // Wrap to provide the (_, event) shape that onCancel expects.
    const handleClose = () => {
        const noop = () => {}
        onCancel?.({}, { stopPropagation: noop, preventDefault: noop } as unknown as React.MouseEvent<HTMLButtonElement>)
    }

    return (
        <Modal small onClose={handleClose}>
            {title && <ModalTitle>{title}</ModalTitle>}
            <ModalContent>{children}</ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onCancel} secondary>
                        Cancel
                    </Button>
                    <Button primary={!destructive} destructive={destructive} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
