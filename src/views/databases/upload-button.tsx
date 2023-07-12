import { useAlert } from '@dhis2/app-service-alerts'
import { FileInput, LinearLoader } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { GroupWithDatabases } from '../../types'
import styles from './upload-button.module.css'

export const UploadButton = ({ groupName, onComplete }: { groupName: string; onComplete: Function }) => {
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [uploadProgress, setUploadProgress] = useState(0)
    const [fileName, setFileName] = useState('')
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
        { manual: true, autoCatch: false }
    )
    const onFileSelect = useCallback(
        async ({ files }) => {
            try {
                const file = files[0]
                const formData = new FormData()
                formData.append('group', groupName)
                formData.append('database', file, file.name)
                setFileName(file.name)
                await postDatabase({ data: formData })
                showAlert({
                    message: 'Database added successfully',
                    isCritical: false,
                })
                onComplete()
            } catch (error) {
                console.error(error)
                showAlert({
                    message: 'There was a problem uploading the database',
                    isCritical: true,
                })
            }
        },
        [groupName, onComplete, postDatabase, showAlert]
    )

    return (
        <div className={styles.container}>
            <FileInput buttonLabel="Upload a database" onChange={onFileSelect} disabled={loading} />
            {loading && (
                <div className={styles.progressWrap}>
                    <span className={styles.label}>
                        Uploading database <b>{fileName}</b> ({uploadProgress}%)
                        <button className={styles.cancelButton} onClick={cancelPostRequest}>
                            Cancel
                        </button>
                    </span>
                    <LinearLoader amount={uploadProgress} />
                </div>
            )}
        </div>
    )
}
