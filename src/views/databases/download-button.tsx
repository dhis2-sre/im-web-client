import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDownload16 } from '@dhis2/ui'
import { useCallback } from 'react'
import { useAuthAxios } from '../../hooks'
import { baseURL } from '../../hooks/use-auth-axios'
import { ExternalDownload } from '../../types'
import type { FC } from 'react'

type DownloadButtonProps = { id: number }

export const DownloadButton: FC<DownloadButtonProps> = ({ id }) => {
    const { show: showError } = useAlert('Could not retrieve database UID', { critical: true })
    const [{ loading }, fetchDownloadLink] = useAuthAxios<ExternalDownload>(
        {
            url: `/databases/${id}/external`,
            method: 'post',
            data: {
                expiration: 5,
            },
        },
        { manual: true }
    )

    const onClick = useCallback(async () => {
        try {
            const { data } = await fetchDownloadLink()
            const link = document.createElement('a')
            link.href = `${baseURL}/databases/external/${data.uuid}`
            link.target = '_blank'
            link.click()
            link.remove()
        } catch (error) {
            console.error(error)
            showError()
        }
    }, [fetchDownloadLink, showError])

    return (
        <Button small secondary loading={loading} icon={<IconDownload16 />} onClick={onClick}>
            Download
        </Button>
    )
}
