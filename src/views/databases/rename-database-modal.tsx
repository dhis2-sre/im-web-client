import { useAlert } from '@dhis2/app-service-alerts'
import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { FC, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'

type RenameDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
    databaseId: number
    currentName: string
}

export const RenameDatabaseModal: FC<RenameDatabaseModalProps> = ({ onClose, onComplete, databaseId, currentName }) => {
    const [newName, setNewName] = useState<string>(currentName)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, putDatabase] = useAuthAxios<GroupsWithDatabases>({
        url: `/databases/${databaseId}`,
        method: 'PUT',
    })

    const onRename = async () => {
        try {
            await putDatabase({
                data: { name: newName },
            })
            showAlert({
                message: 'Database renamed successfully',
                isCritical: false,
            })
            onComplete()
        } catch (error) {
            showAlert({
                message: 'There was a problem renaming the database',
                isCritical: true,
            })
            console.error(error)
        }
    }

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Rename Database</ModalTitle>
            <ModalContent>
                <InputField label="New Name" value={newName} onChange={({ value }) => setNewName(value)} required disabled={loading} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onRename} disabled={loading || newName === currentName} loading={loading} primary>
                        Rename
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
