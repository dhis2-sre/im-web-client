import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfirmationModal } from '../confirmation-modal.tsx'
import { TypedConfirmationModal } from './typed-confirmation-modal.tsx'

export type ConfirmOptions = {
    title: string
    message: ReactNode
    /* The verb on the confirm button. Defaults to Confirm. */
    confirmLabel?: string
    destructive?: boolean
    /* The second tier, for deletes that cannot be undone: the user types the name to confirm, and the
     * dialog lists what goes with it. */
    typed?: { name: string; consequences?: string[] }
}

type Pending = { options: ConfirmOptions; action: () => void }

/* Asks before an action runs. confirm() opens the dialog and runs the action only once it is
 * accepted; render the returned modal wherever the hook is used. */
export const useConfirmedAction = () => {
    const [pending, setPending] = useState<Pending | null>(null)

    const confirm = useCallback((options: ConfirmOptions, action: () => void) => setPending({ options, action }), [])
    const cancel = useCallback(() => setPending(null), [])
    const accept = useCallback(() => {
        setPending(null)
        pending?.action()
    }, [pending])

    if (!pending) {
        return { confirm, modal: null }
    }

    const { title, message, confirmLabel = 'Confirm', destructive, typed } = pending.options
    const modal = typed ? (
        <TypedConfirmationModal title={title} name={typed.name} consequences={typed.consequences} confirmLabel={confirmLabel} onConfirm={accept} onCancel={cancel}>
            {message}
        </TypedConfirmationModal>
    ) : (
        <ConfirmationModal title={title} confirmLabel={confirmLabel} destructive={destructive} onConfirm={accept} onCancel={cancel}>
            {message}
        </ConfirmationModal>
    )

    return { confirm, modal }
}
