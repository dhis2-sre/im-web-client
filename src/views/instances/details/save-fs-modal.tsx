import { useAlert } from '@dhis2/app-service-alerts'
import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { Database } from '../../../types/index.ts'
import { AsyncActionProps } from './actions-dropdown-menu.tsx'
import styles from './save-as-modal.module.css'

interface SaveFsModalProps extends AsyncActionProps {
    onClose: () => void
}

export const SaveFsModal: FC<SaveFsModalProps> = ({ instanceId, onClose, onStart, onComplete }) => {
    const [name, setName] = useState<string>('')
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, saveAs] = useAuthAxios<Database>(
        {
            url: `/instances/${instanceId}/backup`,
            method: 'post',
            data: { name },
        },
        { manual: true, autoCancel: false }
    )

    const submit = useCallback(async () => {
        try {
            onStart()
            await saveAs()
            showAlert({
                message: 'Backup request submitted successfully',
                isCritical: false,
            })
            onClose()
            /* No need to refetch the instance list since this
             * adds a DB not an instance */
            onComplete(false)
        } catch (error) {
            showAlert({
                message: 'There was a problem submitting the request',
                isCritical: true,
            })
            console.error(error)
            onComplete(false)
        }
    }, [saveAs, showAlert, onClose, onStart, onComplete])

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Save file storage</ModalTitle>
            <ModalContent className={styles.container}>
                <div className={styles.fileAndExtension}>
                    <InputField className={styles.field} label="Backup name" value={name} onChange={({ value }) => setName(value)} required disabled={loading} />
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={submit} disabled={loading}>
                        Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
