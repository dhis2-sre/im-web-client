import { useAlert } from '@dhis2/app-service-alerts'
import { Button, Modal, ModalActions, ModalContent, ModalTitle, InputField, ButtonStrip } from '@dhis2/ui'
import { FC, useState, useEffect } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/index.ts'
import styles from './upload-database-modal.module.css'

type CopyDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
    databaseId: number
    currentName: string
    groupName: string
}

export const CopyDatabaseModal: FC<CopyDatabaseModalProps> = ({ onClose, onComplete, databaseId, currentName, groupName }) => {
    const [newName, setNewName] = useState<string>(currentName)
    const [selectedGroup, setSelectedGroup] = useState<string>(groupName)
    const [groups, setGroups] = useState<Group[]>([])
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ data: groupsData, loading: groupsLoading }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    })

    useEffect(() => {
        if (groupsData) {
            setGroups(groupsData)
            if (!groupsData.some((group) => group.name === selectedGroup)) {
                setSelectedGroup(groupsData[0]?.name || '')
            }
        }
    }, [groupsData, selectedGroup])

    const [{ loading }, postCopyDatabase] = useAuthAxios({
        url: `/databases/${databaseId}/copy`,
        method: 'POST',
    })

    const onCopyDatabase = async () => {
        if (newName === currentName) {
            showAlert({
                message: 'New name cannot be the same as the current name.',
                isCritical: true,
            })
            return
        }

        try {
            await postCopyDatabase({
                data: { group: selectedGroup, name: newName },
            })
            showAlert({
                message: `Database "${currentName}" copied successfully.`,
                isCritical: false,
            })
            onComplete()
        } catch (error) {
            showAlert({
                message: 'There was a problem copying the database',
                isCritical: true,
            })
            console.error(error)
        }
    }

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Copy Database</ModalTitle>
            <ModalContent>
                <InputField label="New Name" value={newName} onChange={({ value }) => setNewName(value)} required disabled={loading} />
                <div className={styles.field}>
                    <label htmlFor="group-select" className={styles.label}>
                        Select Group *
                    </label>
                    <select value={selectedGroup} onChange={({ target }) => setSelectedGroup(target.value)} disabled={loading || groupsLoading} className={styles.select}>
                        {groupsLoading ? (
                            <option disabled>Loading...</option>
                        ) : groups.length === 0 ? (
                            <option disabled>No groups available</option>
                        ) : (
                            groups.map((group) => (
                                <option key={group.name} value={group.name}>
                                    {group.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={onCopyDatabase} disabled={loading || !newName || !selectedGroup} loading={loading} primary>
                        Copy
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
