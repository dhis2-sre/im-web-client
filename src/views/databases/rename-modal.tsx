import { useAlert } from '@dhis2/app-service-alerts'
import { Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Button, InputField } from '@dhis2/ui'
import React, { useState, useCallback } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'

interface RenameModalProps {
    databaseId: string
    currentName: string
    onClose: () => void
    onComplete: () => void
}

export const RenameModal: React.FC<RenameModalProps> = ({ databaseId, currentName, onClose, onComplete }) => {
    const [newName, setNewName] = useState(currentName)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, renameDatabase] = useAuthAxios(
        {
            url: `/databases/${databaseId}`,
            method: 'PUT',
        },
        { manual: true }
    )

    const handleRename = useCallback(async () => {
        try {
            await renameDatabase({ data: { name: newName } })
            showAlert({ message: 'Database renamed successfully', isCritical: false })
            onComplete()
        } catch (error) {
            showAlert({ message: 'Error renaming database', isCritical: true })
            console.error(error)
        }
    }, [renameDatabase, newName, showAlert, onComplete])

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Rename Database</ModalTitle>
            <ModalContent>
                <InputField label="New name (rename with different path in order to move the file)" value={newName} onChange={({ value }) => setNewName(value)} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={handleRename} disabled={loading || newName === currentName || !newName.trim()}>
                        Rename
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

// Make sure there's a default export as well
export default RenameModal
