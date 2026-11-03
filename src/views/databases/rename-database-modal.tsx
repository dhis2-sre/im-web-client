import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import { FC, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database, UpdateDatabaseRequest } from '../../types/index.ts'
import { errorMessage } from '../../utils/error-message.ts'

type RenameDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
    databaseId: number
    currentName: string
    currentDescription: string
}

/* Edits the name and the description together, so it is titled and saved as an edit. */
export const RenameDatabaseModal: FC<RenameDatabaseModalProps> = ({ onClose, onComplete, databaseId, currentName, currentDescription }) => {
    const [newName, setNewName] = useState<string>(currentName)
    const [newDescription, setNewDescription] = useState<string>(currentDescription)
    const [error, setError] = useState<string>()
    const alert = useActionAlert()
    const unchanged = newName === currentName && newDescription === currentDescription

    const [{ loading }, renameDatabase] = useAuthAxios<Database>({ url: `/databases/${databaseId}`, method: 'PUT' }, { manual: true })

    const onSave = async () => {
        setError(undefined)
        try {
            await renameDatabase({ data: { name: newName, description: newDescription } as UpdateDatabaseRequest })
            alert.success(newName === currentName ? `Saved ${newName}` : `Renamed to ${newName}`)
            onComplete()
            onClose()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }

    return (
        <Modal onClose={loading ? undefined : onClose}>
            <ModalTitle>Edit {currentName}</ModalTitle>
            <ModalContent>
                <InputField label="Name" value={newName} onChange={({ value }) => setNewName(value ?? '')} required disabled={loading} />
                <InputField label="Description" value={newDescription} onChange={({ value }) => setNewDescription(value ?? '')} required disabled={loading} />
                {error && (
                    <NoticeBox error title={`Couldn't save ${currentName}`}>
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={() => void onSave()} disabled={unchanged || !newName.trim()} loading={loading}>
                        Save
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
