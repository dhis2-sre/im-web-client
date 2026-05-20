import moment from 'moment'
import type { FC, ReactNode } from 'react'

type MomentProps = {
    date?: string | number | Date
    children?: ReactNode
    fromNow?: boolean
    format?: string
}

const resolveDate = (date: MomentProps['date'], children: MomentProps['children']) => {
    if (date !== undefined && date !== null) {
        return date
    }
    if (typeof children === 'string' || typeof children === 'number') {
        return children
    }
    return undefined
}

export const Moment: FC<MomentProps> = ({ date, children, fromNow, format }) => {
    const value = resolveDate(date, children)
    if (value === undefined) {
        return null
    }
    const m = moment(value)
    const text = fromNow ? m.fromNow() : format ? m.format(format) : m.format()
    return <time dateTime={m.toISOString()}>{text}</time>
}
