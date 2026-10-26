import { IconCheckmarkCircle16, IconClock16, IconErrorFilled16, IconSync16, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import type { Status, StatusTone } from './statuses.ts'

const TAG_PROPS: Record<StatusTone, { positive?: boolean; negative?: boolean; neutral?: boolean }> = {
    positive: { positive: true },
    negative: { negative: true },
    neutral: { neutral: true },
    progress: {},
}

/* Each tone has its own shape as well as its own colour, so a status reads without telling colours apart. */
const ICONS: Record<StatusTone, FC> = {
    positive: IconCheckmarkCircle16,
    negative: IconErrorFilled16,
    neutral: IconClock16,
    progress: IconSync16,
}

export const toneTagProps = (tone: StatusTone) => TAG_PROPS[tone]
export const ToneIcon: FC<{ tone: StatusTone }> = ({ tone }) => {
    const Icon = ICONS[tone]
    return <Icon />
}

export const StatusIndicator: FC<{ status: Status }> = ({ status }) => {
    const Icon = ICONS[status.tone]
    const tag = (
        <Tag {...TAG_PROPS[status.tone]} icon={<Icon />}>
            {status.label}
        </Tag>
    )

    return status.detail ? <span title={status.detail}>{tag}</span> : tag
}
