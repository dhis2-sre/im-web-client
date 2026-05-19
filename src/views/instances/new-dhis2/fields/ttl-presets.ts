export const HOUR_IN_SECONDS = 60 * 60
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24

export const CUSTOM_VALUE = 'custom'
export const CUSTOM_LABEL = 'Custom...'

export type TtlPreset = { label: string; seconds: number }

export const TTL_PRESETS: TtlPreset[] = [
    { label: '1 hour', seconds: HOUR_IN_SECONDS },
    { label: '6 hours', seconds: 6 * HOUR_IN_SECONDS },
    { label: '12 hours', seconds: 12 * HOUR_IN_SECONDS },
    { label: '1 day', seconds: DAY_IN_SECONDS },
    { label: '2 days', seconds: 2 * DAY_IN_SECONDS },
    { label: '5 days', seconds: 5 * DAY_IN_SECONDS },
    { label: '1 week', seconds: 7 * DAY_IN_SECONDS },
    { label: '2 weeks', seconds: 14 * DAY_IN_SECONDS },
    { label: '1 month', seconds: 28 * DAY_IN_SECONDS },
]
