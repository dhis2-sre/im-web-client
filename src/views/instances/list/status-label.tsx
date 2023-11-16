import { CircularLoader, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks'
import { InstanceStatus } from '../../../types'

type StatusLabelProps = {
    instanceId: number
}

export const StatusLabel: FC<StatusLabelProps> = ({ instanceId }) => {
    const [{ data, loading }] = useAuthAxios<InstanceStatus>({
        method: 'GET',
        url: `/instances/${instanceId}/status`,
    })

    if (loading) {
        return <CircularLoader small />
    }

    return <Tag>{data}</Tag>
}
