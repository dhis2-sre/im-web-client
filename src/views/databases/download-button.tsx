import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconLaunch16 } from '@dhis2/ui'
import { useEffect } from 'react'
import { useAuthAxios } from '../../hooks'
import { baseURL } from '../../hooks/useAuthAxios'
import { ExternalDownload } from '../../types'

export const DownloadButton = ({ id }: { id: number }) => {
    const { show: showError } = useAlert('Could not retrieve database UID', { critical: true })
    const [{ response, error, loading }, fetchDownloadLink] = useAuthAxios<ExternalDownload>(
        {
            url: `/databases/${id}/external`,
            method: 'post',
            data: {
                expiration: 5,
            },
        },
        {
            manual: true,
        }
    )

    useEffect(() => {
        if (response?.status === 201 && !loading) {
            const link = document.createElement('a')
            link.href = baseURL + '/databases/external/' + response.data.uuid
            link.target = '_blank'
            link.click()
            link.parentElement.removeChild(link)
        }
    }, [response, loading])

    useEffect(() => {
        if (error && !loading) {
            showError()
        }
    }, [error, loading, showError])

    return (
        <Button small loading={loading} icon={<IconLaunch16 />} onClick={fetchDownloadLink}>
            Download
        </Button>
    )
}
