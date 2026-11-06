import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { FC, useEffect, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/index.ts'
import { errorMessage } from '../../utils/error-message.ts'

type CopyDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
    databaseId: number
    currentName: string
    currentGroup: string
}

/* "-copy" goes before the extension, so the copy keeps the format the name says it has. */
const copyName = (name: string) => name.replace(/(\.sql\.gz|\.pgc)?$/, (extension) => `-copy${extension}`)

export const CopyDatabaseModal: FC<CopyDatabaseModalProps> = ({ onClose, onComplete, databaseId, currentName, currentGroup }) => {
    const [newName, setNewName] = useState(copyName(currentName))
    const [group, setGroup] = useState(currentGroup)
    const [error, setError] = useState<string>()
    const alert = useActionAlert()
    /* Names only need to be unique within a group. */
    const sameName = newName.trim() === currentName && group === currentGroup

    const [{ data: groups, loading: groupsLoading }] = useAuthAxios<Group[]>({ method: 'GET', url: '/groups' })
    const [{ loading }, copyDatabase] = useAuthAxios({ url: `/databases/${databaseId}/copy`, method: 'POST' }, { manual: true })

    useEffect(() => {
        if (groups && !groups.some(({ name }) => name === group)) {
            setGroup(groups[0]?.name ?? '')
        }
    }, [groups, group])

    const onCopy = async () => {
        setError(undefined)
        try {
            await copyDatabase({ data: { group, name: newName.trim() } })
            alert.success(`Copied to ${group}/${newName.trim()}`)
            onComplete()
            onClose()
        } catch (caught) {
            console.error(caught)
            setError(errorMessage(caught))
        }
    }

    return (
        <Modal onClose={loading ? undefined : onClose}>
            <ModalTitle>Copy {currentName}</ModalTitle>
            <ModalContent>
                <InputField
                    name="newName"
                    label="Name of the copy"
                    value={newName}
                    onChange={({ value }) => setNewName(value ?? '')}
                    required
                    disabled={loading}
                    error={sameName}
                    validationText={sameName ? 'The original is already in this group. Choose another name or group.' : undefined}
                />
                <SingleSelectField
                    label="Copy to group"
                    selected={groups?.some(({ name }) => name === group) ? group : undefined}
                    onChange={({ selected }) => setGroup(selected)}
                    loading={groupsLoading}
                    disabled={loading}
                    filterable
                    noMatchText="No group matches"
                    required
                >
                    {(groups ?? []).map(({ name }) => (
                        <SingleSelectOption key={name} label={name} value={name} />
                    ))}
                </SingleSelectField>
                {error && (
                    <NoticeBox error title={`Couldn't copy ${currentName}`}>
                        {error}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button primary onClick={() => void onCopy()} disabled={!newName.trim() || sameName || !group} loading={loading}>
                        Copy
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
