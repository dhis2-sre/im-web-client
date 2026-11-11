import { IconCheckmarkCircle16, IconClock16, IconSync16, IconWarning16, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import dotStyles from './status-dot.module.css'
import styles from './status-indicator.module.css'
import type { Status, StatusTone } from './statuses.ts'

const TAG_PROPS: Record<StatusTone, { positive?: boolean; negative?: boolean; neutral?: boolean }> = {
    positive: { positive: true },
    negative: { negative: true },
    /* The default grey tag: dhis2's neutral tag is light blue, which reads as in progress. */
    neutral: {},
    progress: {},
}

/* Each tone has its own shape as well as its own colour, for the places that show a status as an icon
 * alone, without a label. */
const ICONS: Record<StatusTone, FC> = {
    positive: IconCheckmarkCircle16,
    negative: IconWarning16,
    neutral: IconClock16,
    progress: IconSync16,
}

export const toneTagProps = (tone: StatusTone) => TAG_PROPS[tone]
export const ToneIcon: FC<{ tone: StatusTone }> = ({ tone }) => {
    const Icon = ICONS[tone]
    return <Icon />
}

/* A tag with a coloured dot rather than an icon: the label already says what the state is, so the
 * dot only needs to carry its colour, matching the dots beside page and stack names. */
export const StatusIndicator: FC<{ status: Status }> = ({ status }) => {
    const tag = (
        <Tag {...TAG_PROPS[status.tone]} icon={<span className={`${dotStyles.dot} ${dotStyles[status.tone]} ${styles.tagDot}`} aria-hidden="true" />}>
            {status.label}
        </Tag>
    )

    return status.detail ? <span title={status.detail}>{tag}</span> : tag
}
