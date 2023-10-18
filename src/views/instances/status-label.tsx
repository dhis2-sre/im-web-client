import { CircularLoader, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { InstanceStatus } from '../../types'

type StatusLabelProps = {
    instanceId: number
}

export const StatusLabel: FC<StatusLabelProps> = ({ instanceId }) => {
    const [status, setStatus] = useState('')
    const [{ data, loading, error: groupsError }] = useAuthAxios<InstanceStatus>({
        method: 'GET',
        url: `/instances/${instanceId}/status`,
    })

    if (loading) {
        return <CircularLoader />
    }

    return <Tag>{data}</Tag>
}
