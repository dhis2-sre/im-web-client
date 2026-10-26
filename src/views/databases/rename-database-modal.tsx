import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import { FC, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database, UpdateDatabaseRequest } from '../../types/index.ts'

type RenameDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
    databaseId: number
    currentName: string
    currentDescription: string
}

export const RenameDatabaseModal: FC<RenameDatabaseModalProps> = ({ onClose, onComplete, databaseId, currentName, currentDescription }) => {
    const [newName, setNewName] = useState<string>(currentName)
    const [newDescription, setNewDescription] = useState<string>(currentDescription)
    const alert = useActionAlert()

    const [{ loading }, renameDatabase] = useAuthAxios<Database>(
        {
            url: `/databases/${databaseId}`,
            method: 'PUT',
        },
        { manual: true }
    )

    const onRename = async () => {
        try {
            await renameDatabase({
                data: { name: newName, description: newDescription } as UpdateDatabaseRequest,
            })
            alert.success(`Renamed to ${newName}`)
            onComplete()
            onClose()
        } catch (error) {
            alert.error(error.response?.data?.message || `Couldn't rename ${currentName}`)
            onComplete()
            onClose()
        }
    }

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Rename Database</ModalTitle>
            <ModalContent>
                <InputField label="New Name" value={newName} onChange={({ value }: { value: string }) => setNewName(value)} required disabled={loading} />
                <InputField label="New Description" value={newDescription} onChange={({ value }: { value: string }) => setNewDescription(value)} required disabled={loading} />
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onRename} disabled={loading || (newName === currentName && newDescription === currentDescription)} loading={loading} primary>
                        Rename
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
