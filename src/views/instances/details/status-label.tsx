import { CircularLoader, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks'
import styles from './status-label.module.css'
import { getTagProps } from '../../../utils/tag'

type Status = 'NotDeployed' | 'Pending' | 'Booting' | 'Booting (%d)' | 'Running' | 'Error'

const Content: FC<{ status: string; loading: boolean }> = ({ status, loading }) => {
    if (loading) {
        return <CircularLoader extrasmall />
    } else if (status) {
        return status
    } else {
        return 'Unknown'
    }
}

export const StatusLabel: FC<{
    instanceId: number
}> = ({ instanceId }) => {
    const [{ data: status, loading }] = useAuthAxios<Status>({
        method: 'GET',
        url: `/instances/${instanceId}/status`,
    })

    return (
        <span className={styles.wrapper}>
            <Tag {...getTagProps(status)}>
                <Content status={status} loading={loading} />
            </Tag>
        </span>
    )
}
