import { FileUploadField, LinearLoader, FileListItem } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { GroupWithDatabases } from '../../types'
import { useAlert } from '@dhis2/app-service-alerts'

export const UploadButton = ({ id }: { id: string }) => {
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
    const [{ response, error, loading }, postDatabase] = useAuthAxios<GroupWithDatabases>(
        {
            url: `/databases`,
            method: 'post',
            onUploadProgress,
        },
        { manual: true }
    )
    const

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

    return (
        <Button small loading={loading} icon={<IconLaunch16 />} onClick={fetchDownloadLink}>
            Download
        </Button>
    )
}
