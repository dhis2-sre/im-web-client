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
    const [{ data, loading: statusLoading, error: groupsError }] = useAuthAxios<InstanceStatus>({
        method: 'GET',
        url: `/instances/${instanceId}/status`,
    })

    useEffect(() => {
        setStatus(data)
    }, [data])

    if (statusLoading) {
        return <CircularLoader />
    }

    return <Tag>{status}</Tag>
}
