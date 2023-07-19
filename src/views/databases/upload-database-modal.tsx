import {
    Button,
    ButtonStrip,
    Center,
    CircularLoader,
    FileInput,
    LinearLoader,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import styles from './upload-database-modal.module.css'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { useAlert } from '@dhis2/app-service-alerts'
import { Group, GroupWithDatabases } from '../../types'

type UploadDatabaseModalProps = {
    onClose: Function
    onComplete: Function
}

export const UploadDatabaseModal: FC<UploadDatabaseModalProps> = ({ onClose, onComplete }) => {
    const [group, setGroup] = useState('')
    const [databaseFile, setDatabaseFile] = useState(new Blob())

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [uploadProgress, setUploadProgress] = useState(0)

    const onUploadProgress = useCallback((progressEvent) => {
        const { loaded, total } = progressEvent
        const percentage = Math.floor((loaded * 100) / total)
        setUploadProgress(percentage)
    }, [])

    const [{ loading }, postDatabase, cancelPostRequest] = useAuthAxios<GroupWithDatabases>(
        {
            url: `/databases`,
            method: 'post',
            onUploadProgress,
        },
        { manual: true }
    )

    const onUpload = useCallback(async () => {
        // TODO: How do I disable the upload button until a file is selected
        if (databaseFile.size === 0) {
            showAlert({
                message: 'No file selected',
                isCritical: true,
            })
            return
        }

        try {
            const formData = new FormData()
            formData.append('group', group)
            formData.append('database', databaseFile, databaseFile.name)
            await postDatabase({ data: formData })
            showAlert({
                message: 'Database added successfully',
                isCritical: false,
            })
            onComplete()
        } catch (error) {
            showAlert({
                message: 'There was a problem uploading the database',
                isCritical: true,
            })
            console.error(error)
        }
    }, [databaseFile, group, onComplete, postDatabase, showAlert])

    const [{ data: groups, loading: groupsLoading, error: groupsError }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    })

    if (groupsError) {
        showAlert({ message: 'There was a problem loading the groups', isCritical: true })
        console.error(groupsError)
    }
    const onFileSelect = useCallback(async ({ files }) => setDatabaseFile(files[0]), [])

    useEffect(() => {
        if (groups && groups.length > 0) {
            setGroup(groups[0].name)
        }
    }, [groups])

    if (groupsLoading) {
        return
    }

    return (
        <Modal fluid onClose={onClose}>
            <ModalTitle>Upload database</ModalTitle>
            <ModalContent>
                <SingleSelectField className={styles.field} selected={group} filterable={true} onChange={({ selected }) => setGroup(selected)} label="Group">
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <FileInput buttonLabel="Select database" onChange={onFileSelect} disabled={loading} />
                {loading && (
                    <div className={styles.progressWrap}>
                        <span className={styles.label}>
                            Uploading database <b>{databaseFile.name}</b> ({uploadProgress}%)
                            <button className={styles.cancelButton} onClick={cancelPostRequest}>
                                Cancel
                            </button>
                        </span>
                        <LinearLoader amount={uploadProgress} />
                    </div>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onUpload} disabled={loading}>
                        Upload
                    </Button>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                </ButtonStrip>
            </ModalActions>
            {loading && (
                <Center>
                    <CircularLoader />
                </Center>
            )}
        </Modal>
    )
}
