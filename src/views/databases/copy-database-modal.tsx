import { useAlert } from '@dhis2/app-service-alerts'
import { Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Button, InputField, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useState, useCallback } from 'react'
import type { FC } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'

interface CopyDatabaseModalProps {
    databaseId: string
    currentName: string
    currentGroup: string
    groups: string[]
    onClose: () => void
    onComplete: () => void
}

export const CopyDatabaseModal: FC<CopyDatabaseModalProps> = ({ databaseId, currentName, currentGroup, groups, onClose, onComplete }) => {
    const [newName, setNewName] = useState(() => {
        // const nameParts = currentName.split('.')
        const extension = currentName.endsWith('.sql.gz') ? '.sql.gz' : (currentName.match(/\.[^.]+$/) || [''])[0]
        const baseName = currentName.slice(0, -extension.length)
        return `${baseName}-copy${extension}`
    })
    const [selectedGroup, setSelectedGroup] = useState(currentGroup)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, copyDatabase] = useAuthAxios(
        {
            url: `/databases/${databaseId}/copy`,
            method: 'POST',
        },
        { manual: true }
    )

    const handleCopy = useCallback(async () => {
        try {
            await copyDatabase({ data: { group: selectedGroup, name: newName } })
            showAlert({ message: 'Database copied successfully', isCritical: false })
            onComplete()
        } catch (error) {
            showAlert({ message: 'Error copying database', isCritical: true })
            console.error(error)
        }
    }, [copyDatabase, selectedGroup, newName, showAlert, onComplete])

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Copy Database</ModalTitle>
            <ModalContent>
                <SingleSelectField label="Group" selected={selectedGroup} onChange={({ selected }) => setSelectedGroup(selected)}>
                    {groups.map((group) => (
                        <SingleSelectOption key={group} value={group} label={group} />
                    ))}
                </SingleSelectField>
                <InputField label="New name" value={newName} onChange={({ value }) => setNewName(value)} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={handleCopy} disabled={loading || !newName.trim()}>
                        Copy
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
