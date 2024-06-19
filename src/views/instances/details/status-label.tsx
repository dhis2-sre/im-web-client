import { CircularLoader, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks'
import styles from './status-label.module.css'

type Status = 'NotDeployed' | 'Pending' | 'Booting' | 'Booting (%d)' | 'Running' | 'Error'

const getTagProps = (status: Status) => {
    if (!status) return
    if (status.includes('Booting') || status === 'Pending') {
        return { neutral: true };
    } else if (status === 'Error') {
        return { negative: true };
    } else if (status === 'Running') {
        return { positive: true };
    } else {
        return {};
    }
}

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
