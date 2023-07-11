import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDownload16 } from '@dhis2/ui'
import { useCallback } from 'react'
import { useAuthAxios } from '../../hooks'
import { baseURL } from '../../hooks/useAuthAxios'
import { ExternalDownload } from '../../types'

export const DownloadButton = ({ id }: { id: number }) => {
    const { show: showError } = useAlert('Could not retrieve database UID', { critical: true })
    const [{ loading }, fetchDownloadLink] = useAuthAxios<ExternalDownload>(
        {
            url: `/databases/${id}/external`,
            method: 'post',
            data: {
                expiration: 5,
            },
        },
        {
            manual: true,
            autoCatch: false,
        }
    )

    const onClick = useCallback(async () => {
        try {
            const { data } = await fetchDownloadLink()
            const link = document.createElement('a')
            link.href = `${baseURL}/databases/external/${data.uuid}`
            link.target = '_blank'
            link.click()
            link.remove()
        } catch {
            showError()
        }
    }, [fetchDownloadLink, showError])

    return (
        <Button small secondary loading={loading} icon={<IconDownload16 />} onClick={onClick}>
            Download
        </Button>
    )
}
