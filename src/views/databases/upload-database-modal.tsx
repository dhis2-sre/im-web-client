import { useAlert } from '@dhis2/app-service-alerts'
import { Button, ButtonStrip, FileInput, InputField, LinearLoader, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import React, { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'
import styles from './upload-database-modal.module.css'

interface UploadDatabaseModalProps {
    onClose: () => void
    onComplete: () => void
    currentPath: string
    groupName: string
}

export const UploadDatabaseModal: React.FC<UploadDatabaseModalProps> = ({ onClose, onComplete, currentPath, groupName }) => {
    const [databaseFile, setDatabaseFile] = useState<File | null>(null)
    const [destinationName, setDestinationName] = useState<string>('')
    const [formatValidation, setFormatValidation] = useState<string>('')
    const [fileExtension, setFileExtension] = useState<string>('')

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

    const [{ loading }, postDatabase, cancelPostRequest] = useAuthAxios<GroupsWithDatabases>(
        {
            url: `/databases`,
            method: 'post',
            onUploadProgress,
        },
        { manual: true }
    )

    const validateFormat = (fileName: string) => {
        if (fileName.endsWith('.sql.gz')) {
            setFormatValidation('plain format')
            setFileExtension('.sql.gz')
        } else if (fileName.endsWith('.pgc')) {
            setFormatValidation('custom format')
            setFileExtension('.pgc')
        } else {
            setFormatValidation('invalid format')
            setFileExtension('')
        }
    }

    const onFileSelect = useCallback(async ({ files }) => {
        const uploadedFile = files[0]
        setDatabaseFile(uploadedFile)
        validateFormat(uploadedFile.name)

        // Set initial destination name, but allow user to change it
        const fileNameWithoutExtension = uploadedFile.name.replace(/\.(sql\.gz|pgc)$/, '')
        setDestinationName(fileNameWithoutExtension)
    }, [])

    const onUpload = useCallback(async () => {
        if (!databaseFile) {
            showAlert({
                message: 'No file selected',
                isCritical: true,
            })
            return
        }

        if (formatValidation === 'invalid format') {
            showAlert({
                message: 'Invalid file format. Please select a .sql.gz or .pgc file.',
                isCritical: true,
            })
            return
        }

        try {
            const formData = new FormData()
            formData.append('group', groupName)
            formData.append('database', databaseFile)
            const path = currentPath === groupName ? '' : currentPath.replace(groupName + '/', '')
            const fullPath = path ? path + '/' + destinationName : destinationName
            formData.append('name', fullPath + fileExtension)
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
    }, [databaseFile, groupName, currentPath, destinationName, fileExtension, postDatabase, showAlert, formatValidation, onComplete])

    return (
        <Modal onClose={() => onClose({}, undefined satisfies React.MouseEvent<HTMLDivElement>)} large>
            <ModalTitle>Upload database</ModalTitle>
            <ModalContent className={styles.container}>
                <FileInput buttonLabel="Select database" onChange={onFileSelect} disabled={loading} className={styles.field} />
                {databaseFile && (
                    <div className={styles.progressWrap}>
                        <span className={`${styles.label} ${formatValidation === 'invalid format' ? styles.invalidFormat : ''}`}>
                            {loading ? (
                                <>
                                    Uploading database file: <b>{databaseFile.name}</b> ({uploadProgress}%)
                                    <button className={styles.cancelButton} onClick={cancelPostRequest}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    Selected database file: <b>{databaseFile.name}</b> ({formatValidation})
                                </>
                            )}
                        </span>
                        {loading && <LinearLoader amount={uploadProgress} className={styles.loader} />}
                    </div>
                )}
                <div className={styles.field}>
                    <label className={styles.label}>Destination folder</label>
                    <div className={styles.destinationFolder}>{currentPath}</div>
                </div>
                <div className={styles.destinationNameWrapper}>
                    <InputField
                        className={styles.destinationNameInput}
                        dataTest="upload-database-name"
                        label="Destination Name (use '/' to create additional subfolders)"
                        value={destinationName}
                        onChange={({ value }) => setDestinationName(value)}
                        required
                        disabled={loading}
                    />
                    <span className={styles.fileExtension}>{fileExtension}</span>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button primary onClick={onUpload} disabled={loading || !databaseFile || formatValidation === 'invalid format'}>
                        Upload
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

// Make sure there's a default export as well
export default UploadDatabaseModal
