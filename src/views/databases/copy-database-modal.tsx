import { useAlert } from '@dhis2/app-service-alerts'
import { Button, Modal, ModalActions, ModalContent, ModalTitle, InputField, ButtonStrip } from '@dhis2/ui'
import { FC, useState, useEffect, useCallback } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/index.ts'
import styles from './upload-database-modal.module.css'

type CopyDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
    databaseId: number
    currentName: string
    setOpen: (id: number | null) => void
}

const GroupSelect: FC<{ groups: Group[]; selectedGroup: string; setSelectedGroup: (group: string) => void; loading: boolean }> = ({
    groups,
    selectedGroup,
    setSelectedGroup,
    loading,
}) => {
    const renderOptions = () => {
        if (loading) {
            return <option disabled>Loading...</option>
        }
        if (groups.length === 0) {
            return <option disabled>No groups available</option>
        }
        return groups.map((group) => (
            <option key={group.name} value={group.name}>
                {group.name}
            </option>
        ))
    }
    return (
        <div className={styles.field}>
            <label htmlFor="group-select" className={styles.label}>
                Select Group *
            </label>
            <select id="group-select" value={selectedGroup} onChange={({ target }) => setSelectedGroup(target.value)} disabled={loading} className={styles.select}>
                {renderOptions()}
            </select>
        </div>
    )
}

const useGroups = () => {
    const [groups, setGroups] = useState<Group[]>([])
    const [selectedGroup, setSelectedGroup] = useState<string>('')
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

    return { groups, selectedGroup, setSelectedGroup, groupsLoading }
}

export const CopyDatabaseModal: FC<CopyDatabaseModalProps> = ({ onClose, onComplete, databaseId, currentName, setOpen }) => {
    const [newName, setNewName] = useState<string>(currentName)
    const { groups, selectedGroup, setSelectedGroup, groupsLoading } = useGroups()
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading }, postCopyDatabase] = useAuthAxios({
        url: `/databases/${databaseId}/copy`,
        method: 'POST',
    })

    const onCopyDatabase = useCallback(async () => {
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
            setOpen(null)
        } catch (error) {
            showAlert({
                message: 'There was a problem copying the database',
                isCritical: true,
            })
            console.error(error)
            setOpen(null)
        }
    }, [newName, currentName, selectedGroup, postCopyDatabase, showAlert, onComplete, setOpen])

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Copy Database</ModalTitle>
            <ModalContent>
                <InputField label="New Name" value={newName} onChange={({ value }) => setNewName(value)} required disabled={loading} />
                <GroupSelect groups={groups} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} loading={groupsLoading} />
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
