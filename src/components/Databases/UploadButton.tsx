import { FileInputField, FileListItem } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { GroupWithDatabases } from '../../types'
import { useAlert } from '@dhis2/app-service-alerts'
import { useAuthAxios } from '../../hooks/useAuthAxios'

export const UploadButton = ({ groupName }: { groupName: string }) => {
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
    const [{ response, error, loading }, postDatabase, cancelPostRequest] = useAuthAxios<GroupWithDatabases>(
        {
            url: `/databases`,
            method: 'post',
            onUploadProgress,
        },
        { manual: true }
    )
    const onFileSelect = useCallback(
        ({ files }) => {
            const file = files[0]
            const formData = new FormData()
            formData.append('group', groupName)
            formData.append('database', file, file.name)
            setFileName(file.name)
            postDatabase({ data: formData })
        },
        [groupName, postDatabase]
    )

    useEffect(() => {
        if (response.status === 201 && !loading) {
            showAlert({
                message: 'Database added successfully',
                isCritical: false,
            })
        }
    }, [response, showAlert, loading])

    useEffect(() => {
        if (error && !loading) {
            showAlert({
                message: 'There was a problem uploading the database',
                isCritical: true,
            })
        }
    }, [error, loading, showAlert])

    const fileListItemLabel = `(${uploadProgress}%) ${fileName}`

    return (
        <FileInputField onChange={onFileSelect} label="Upload a database">
            {loading && <FileListItem cancelText="Cancel" label={fileListItemLabel} onCancel={cancelPostRequest} loading />}
        </FileInputField>
    )
}
