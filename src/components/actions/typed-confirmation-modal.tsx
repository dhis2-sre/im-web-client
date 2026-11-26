import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './typed-confirmation-modal.module.css'

type TypedConfirmationModalProps = {
    title: string
    name: string
    /* What goes with it, so the dialog says what is lost and not only what was clicked. */
    consequences?: string[]
    confirmLabel: string
    children?: ReactNode
    onConfirm: () => void
    onCancel: () => void
}

/* The second tier of confirmation, for deletes that cannot be undone and take more with them. The
 * confirm button stays disabled until the name is typed out, which a reflexive click cannot do. */
export const TypedConfirmationModal: FC<TypedConfirmationModalProps> = ({ title, name, consequences, confirmLabel, children, onConfirm, onCancel }) => {
    const [typed, setTyped] = useState('')
    const matches = typed.trim() === name

    return (
        <Modal small onClose={onCancel}>
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>
                <div className={styles.body}>
                    {children && <p className={styles.message}>{children}</p>}
                    {consequences && consequences.length > 0 && (
                        <div>
                            <p className={styles.message}>This also deletes:</p>
                            <ul className={styles.consequences}>
                                {consequences.map((consequence) => (
                                    <li key={consequence}>{consequence}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* The name is what ties the label to the input, so screen readers announce it. */}
                    <InputField
                        name="typed-confirmation"
                        label={`Type ${name} to confirm`}
                        value={typed}
                        onChange={({ value }) => setTyped(value ?? '')}
                        autoComplete="off"
                        dataTest="typed-confirmation-input"
                        initialFocus
                    />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button destructive disabled={!matches} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
