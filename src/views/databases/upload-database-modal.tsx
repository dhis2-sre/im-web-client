import {
    Button,
    ButtonStrip,
    FileInput,
    InputField,
    LinearLoader,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
    TextAreaField,
} from '@dhis2/ui'
import { isCancel } from 'axios'
import type { AxiosProgressEvent } from 'axios'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group, GroupsWithDatabases } from '../../types/index.ts'
import { errorMessage } from '../../utils/error-message.ts'
import styles from './upload-database-modal.module.css'

type UploadDatabaseModalProps = {
    onClose: () => void
    onComplete: () => void
}

/* The format is read off the file's extension, so these are also the only files that can be uploaded. */
const formats = [
    { extension: '.pgc', label: 'Custom format', contentType: 'application/pgc' },
    { extension: '.sql.gz', label: 'Plain SQL', contentType: 'application/gzip' },
]

/* The file comes first because it fills in the name and decides the format; everything after it can be
 * changed. A failed upload stays in the dialog with what was typed. */
export const UploadDatabaseModal: FC<UploadDatabaseModalProps> = ({ onClose, onComplete }) => {
    const [group, setGroup] = useState('')
    const [databaseFile, setDatabaseFile] = useState<File>()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [fileError, setFileError] = useState<string>()
    const [uploadError, setUploadError] = useState<string>()
    const [uploadProgress, setUploadProgress] = useState(0)
    const format = formats.find(({ extension }) => databaseFile?.name.endsWith(extension))
    const alert = useActionAlert()

    const onUploadProgress = useCallback(({ loaded, total }: AxiosProgressEvent) => setUploadProgress(total ? Math.floor((loaded * 100) / total) : 0), [])
    const [{ loading }, postDatabase, cancelPostRequest] = useAuthAxios<GroupsWithDatabases>({ url: `/databases`, method: 'put', onUploadProgress }, { manual: true })
    const [{ data: groups, loading: groupsLoading, error: groupsError }] = useAuthAxios<Group[]>({ method: 'GET', url: '/groups' })

    useEffect(() => {
        if (groups && groups.length > 0) {
            setGroup(groups[0].name)
        }
    }, [groups])

    const onFileSelect = ({ files }: { files: FileList }) => {
        const file = files[0]
        const match = formats.find(({ extension }) => file?.name.endsWith(extension))
        setUploadError(undefined)
        if (!file || !match) {
            setDatabaseFile(undefined)
            setFileError(file ? 'Only .pgc and .sql.gz files can be uploaded.' : undefined)
            return
        }
        setFileError(undefined)
        setDatabaseFile(file)
        setName(file.name.slice(0, -match.extension.length))
    }

    const onUpload = async () => {
        if (!databaseFile || !format) {
            return
        }
        setUploadError(undefined)
        const fileName = name.trim() + format.extension
        try {
            await postDatabase({
                headers: {
                    'X-Upload-Group': group,
                    'X-Upload-Name': fileName,
                    'X-Upload-Description': description,
                    'Content-Type': format.contentType,
                },
                data: databaseFile,
            })
            alert.success(`Uploaded ${fileName} to ${group}`)
            onComplete()
        } catch (error) {
            if (isCancel(error)) {
                return
            }
            console.error(error)
            setUploadError(errorMessage(error))
        }
    }

    if (groupsLoading) {
        return null
    }

    return (
        <Modal onClose={loading ? undefined : onClose}>
            <ModalTitle>Upload database</ModalTitle>
            <ModalContent className={styles.container}>
                <div className={styles.fileRow}>
                    <FileInput buttonLabel="Choose file" accept=".pgc,.gz" onChange={onFileSelect} disabled={loading} error={!!fileError} />
                    {databaseFile && format && (
                        <span className={styles.label}>
                            <b>{databaseFile.name}</b> · {format.label}
                        </span>
                    )}
                    {fileError && <span className={styles.fileError}>{fileError}</span>}
                </div>
                <div className={styles.fileAndExtension}>
                    <InputField
                        dataTest="upload-database-name"
                        name="databaseName"
                        inputWidth="280px"
                        label="Name"
                        value={name}
                        onChange={({ value }) => setName(value ?? '')}
                        required
                        disabled={loading}
                    />
                    <span>{format?.extension}</span>
                </div>
                <SingleSelectField inputWidth="280px" selected={group} filterable onChange={({ selected }) => setGroup(selected)} label="Group" disabled={loading}>
                    {(groups ?? []).map((group) => (
                        <SingleSelectOption key={group.name} label={group.name} value={group.name} />
                    ))}
                </SingleSelectField>
                <TextAreaField
                    dataTest="upload-database-description"
                    label="Description"
                    inputWidth="280px"
                    value={description}
                    onChange={({ value }) => setDescription(value ?? '')}
                    required
                    disabled={loading}
                />
                {loading && (
                    <div className={styles.progressWrap}>
                        <span className={styles.label}>Uploading… {uploadProgress}%</span>
                        <LinearLoader amount={uploadProgress} className={styles.loader} />
                    </div>
                )}
                {groupsError && (
                    <NoticeBox error title="Couldn't load the groups">
                        {errorMessage(groupsError)}
                    </NoticeBox>
                )}
                {uploadError && (
                    <NoticeBox error title="Couldn't upload the database">
                        {uploadError}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={loading ? cancelPostRequest : onClose}>
                        {loading ? 'Cancel upload' : 'Cancel'}
                    </Button>
                    <Button primary onClick={() => void onUpload()} disabled={!databaseFile || !name.trim() || !group} loading={loading}>
                        Upload
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
