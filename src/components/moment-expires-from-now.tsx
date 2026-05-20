import moment from 'moment'
import { FC, useEffect, useState } from 'react'

const REFRESH_INTERVAL_MS = 60_000

export const MomentExpiresFromNow: FC<{ createdAt: string; ttl: number }> = ({ createdAt, ttl }) => {
    const expiresAt = new Date(createdAt).getTime() + ttl * 1000
    const [, forceTick] = useState(0)

    useEffect(() => {
        const id = setInterval(() => forceTick((n) => n + 1), REFRESH_INTERVAL_MS)
        return () => clearInterval(id)
    }, [])

    return <time dateTime={new Date(expiresAt).toISOString()}>{moment(expiresAt).fromNow()}</time>
}
