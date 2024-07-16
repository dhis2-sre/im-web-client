import {
  BaseButtonProps,
  Button,
  ButtonStrip,
  FileInput,
  InputField,
  LinearLoader,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  SingleSelectField,
  SingleSelectOption
} from '@dhis2/ui'
import styles from './upload-database-modal.module.css'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { useAlert } from '@dhis2/app-service-alerts'
import { Group, GroupsWithDatabases } from '../../types'

type UploadDatabaseModalProps = {
    onClose: BaseButtonProps['onClick']
    onComplete: Function
}

const defaultFormat = 'custom'
const formats = new Map<string, { label: string; extension: string }>([
    ['custom', { label: 'custom (pgc)', extension: '.pgc' }],
    ['plain', { label: 'plain (sql.gz)', extension: '.sql.gz' }],
])

export const UploadDatabaseModal: FC<UploadDatabaseModalProps> = ({ onClose, onComplete }) => {
    const [group, setGroup] = useState('')
    const [databaseFile, setDatabaseFile] = useState<File>(new Blob() as File)
    const [name, setName] = useState<string>('')
    const [format, setFormat] = useState<string>(defaultFormat)
    const [extension, setExtension] = useState<string>(formats.get(defaultFormat).extension)

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
            formData.append('database', databaseFile)
            formData.append('name', name + extension)
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
    }, [databaseFile, group, name, extension, onComplete, postDatabase, showAlert])

    const [{ data: groups, loading: groupsLoading, error: groupsError }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    })

    if (groupsError) {
        showAlert({ message: 'There was a problem loading the groups', isCritical: true })
        console.error(groupsError)
    }

    const onFileSelect = useCallback(async ({ files }) => {
        const uploadedFile = files[0]
        setDatabaseFile(uploadedFile)

        const [matchingFormat, { extension }] = Array.from(formats.entries()).find(([format, { extension }]) => uploadedFile.name.endsWith(extension))
        if (matchingFormat) {
            setName(uploadedFile.name.replace(extension, ''))
            setExtension(extension)
            setFormat(matchingFormat)
        }
    }, [])

    useEffect(() => {
        if (groups && groups.length > 0) {
            setGroup(groups[0].name)
        }
    }, [groups])

    const onSelectChange = useCallback(
        ({ selected }) => {
            setFormat(selected)
            setExtension(formats.get(selected).extension)
        },
        [setFormat, setExtension]
    )

    if (groupsLoading) {
        return
    }

    return (
        <Modal onClose={() => onClose(
          {},
          undefined satisfies React.MouseEvent<HTMLDivElement>
        )}>
            <ModalTitle>Upload database</ModalTitle>
            <ModalContent className={styles.container}>
                <SingleSelectField inputWidth="280px" className={styles.field} selected={group} filterable={true} onChange={({ selected }) => setGroup(selected)} label="Group">
                    {groups.map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <div className={styles.fileAndExtension}>
                    <InputField
                        className={styles.field}
                        dataTest="upload-database-name"
                        label="Name"
                        value={name}
                        onChange={({ value }) => setName(value)}
                        required
                        disabled={loading}
                    />
                    <span>{extension}</span>
                </div>
                <SingleSelectField className={styles.field} selected={format} onChange={onSelectChange} label="Format">
                    {Array.from(formats.keys()).map((key) => (
                        <SingleSelectOption key={key} label={formats.get(key).label} value={key} />
                    ))}
                </SingleSelectField>
                <FileInput buttonLabel="Select database" onChange={onFileSelect} disabled={loading} />
                {databaseFile.size > 0 && (
                    <div className={styles.progressWrap}>
                        <span className={styles.label}>
                            {loading ? (
                                <>
                                    Uploading database file: <b>{name + extension}</b> ({uploadProgress}%)
                                    <button className={styles.cancelButton} onClick={cancelPostRequest}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    Selected database file: <b>{name + extension}</b>
                                </>
                            )}
                        </span>
                        {loading && <LinearLoader amount={uploadProgress} className={styles.loader} />}
                    </div>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onUpload} disabled={loading || databaseFile.size === 0}>
                        Upload
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
