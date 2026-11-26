import { FC } from 'react'
import { MomentFromNow } from './moment-from-now.tsx'

export const MomentExpiresFromNow: FC<{ createdAt: string; ttl: number }> = ({ createdAt, ttl }) => <MomentFromNow date={new Date(createdAt).getTime() + ttl * 1000} />
