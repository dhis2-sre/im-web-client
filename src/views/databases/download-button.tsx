import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, IconDownload16, MenuItem } from '@dhis2/ui'
import { useCallback } from 'react'
import type { FC } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { baseURL } from '../../hooks/use-auth-axios.ts'
import { ExternalDownload } from '../../types/index.ts'

type DownloadButtonProps = { id: number; setOpen: (id: number | null) => void }

export const DownloadButton: FC<DownloadButtonProps> = ({ id, setOpen }) => {
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
            setOpen(null)
        } catch (error) {
            console.error(error)
            showError()
            setOpen(null)
        }
    }, [fetchDownloadLink, showError, setOpen])

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    return <MenuItem dense label={i18n.t('Download')} icon={<IconDownload16 />} onClick={onClick} />
}
