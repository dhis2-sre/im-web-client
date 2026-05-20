import { ComponentType, FC } from 'react'
import * as ReactMoment from 'react-moment'
import type { MomentProps } from 'react-moment'

// react-moment is a CJS UMD bundle; under Vite 8's interop the default import can
// arrive as the module namespace object instead of the class, so resolve it manually.
const Moment = ((ReactMoment as { default?: unknown }).default ?? ReactMoment) as ComponentType<MomentProps>

export const MomentExpiresFromNow: FC<{ createdAt: string; ttl: number }> = ({ createdAt, ttl }) => {
    const date = new Date(createdAt).getTime() + ttl * 1000

    return <Moment date={date} fromNow />
}
