import { FC } from 'react'
import Moment from 'react-moment'

export const MomentExpiresFromNow: FC<{ createdAt: string; ttl: number }> = ({ createdAt, ttl }) => {
    const date = new Date(createdAt).getTime() + ttl * 1000

    return <Moment date={date} fromNow />
}
