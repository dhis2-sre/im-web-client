export const HOUR_IN_SECONDS = 60 * 60
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24

export const CUSTOM_VALUE = 'custom'
export const CUSTOM_LABEL = 'Custom…'

export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = `${DATE_FORMAT} HH:mm`

export type TtlPreset = { label: string; seconds: number }

/* What a new deployment gets if nobody touches the Lifetime field. A day is long enough to be
 * useful and short enough that a forgotten instance cleans itself up. */
export const DEFAULT_TTL_SECONDS = DAY_IN_SECONDS

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

/* The presets count from now, so for an instance with days left the short ones would end it sooner.
 * These are the ones that end it later than it ends now, for a picker that may only extend. */
export const extendingPresets = (ageSeconds: number, ttlSeconds: number) => TTL_PRESETS.filter((preset) => ageSeconds + preset.seconds > ttlSeconds)

/* Why a picked lifetime can't be saved, if it can't. It must end in the future, and when only
 * extending, later than the instance ends now. Nothing is said before a lifetime is picked. */
export const lifetimeError = (ttlSeconds: number, { ageSeconds, ttlSeconds: currentTtlSeconds, extendOnly }: { ageSeconds: number; ttlSeconds: number; extendOnly: boolean }) => {
    if (ttlSeconds <= 0) {
        return undefined
    }
    if (ttlSeconds <= ageSeconds) {
        return 'Pick a date in the future.'
    }
    return extendOnly && ttlSeconds <= currentTtlSeconds ? 'Pick a date after it currently expires.' : undefined
}
