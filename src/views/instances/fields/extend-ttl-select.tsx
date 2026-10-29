import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import moment from 'moment'
import { useState } from 'react'
import { useField } from 'react-final-form'
import { Deployment } from '../../../types/index.ts'
import { CustomDateCalendar } from './custom-date-calendar.tsx'
import styles from './fields.module.css'
import { CUSTOM_LABEL, CUSTOM_VALUE, DATE_FORMAT, DATETIME_FORMAT, extendingPresets, lifetimeError, TTL_PRESETS } from './ttl-presets.ts'

/* The Lifetime field of an existing instance. With extendOnly, as behind an Extend button, it offers
 * only lifetimes that end later than the current one; the edit form may shorten one as well. */
export const ExtendTtlSelect = ({ deployment, extendOnly = false }: { deployment: Deployment; extendOnly?: boolean }) => {
    const originalTtl = deployment.ttl ?? 0
    const createdAtMs = new Date(deployment.createdAt!).getTime()
    const currentEndMs = createdAtMs + originalTtl * 1000

    const [customMode, setCustomMode] = useState(false)
    const [nowMs] = useState(() => Date.now())

    const ageSeconds = Math.floor((nowMs - createdAtMs) / 1000)
    const remainingSeconds = Math.floor((currentEndMs - nowMs) / 1000)

    const { input, meta } = useField<number>('ttl', {
        subscription: { value: true, error: true },
        validate: (v) => (typeof v === 'number' ? lifetimeError(v, { ageSeconds, ttlSeconds: originalTtl, extendOnly }) : undefined),
    })
    const value = Number(input.value) || 0
    const extensionSeconds = value - ageSeconds
    const matchedPreset = TTL_PRESETS.find((p) => p.seconds === extensionSeconds)
    const selected = customMode ? CUSTOM_VALUE : matchedPreset ? String(matchedPreset.seconds) : ''
    const calendarDate = customMode && value > 0 ? moment(createdAtMs + value * 1000).format(DATE_FORMAT) : ''
    const remainingLabel = remainingSeconds > 0 ? `${moment.duration(remainingSeconds, 'seconds').humanize()} remaining` : 'expired'
    const presets = extendOnly ? extendingPresets(ageSeconds, originalTtl) : TTL_PRESETS
    const minDateMs = extendOnly ? Math.max(nowMs, currentEndMs) : nowMs

    const handleSelect = (next: string) => {
        if (next === CUSTOM_VALUE) {
            setCustomMode(true)
        } else {
            setCustomMode(false)
            input.onChange(ageSeconds + parseInt(next, 10))
        }
    }

    const handleDate = (s: string) => input.onChange(Math.floor((new Date(`${s}T23:59:59`).getTime() - createdAtMs) / 1000))

    return (
        <div className={styles.extendTtl}>
            <SingleSelectField
                className={styles.field}
                label={`Lifetime (${remainingLabel})`}
                selected={selected}
                placeholder="Pick a new lifetime…"
                onChange={({ selected: next }: { selected: string }) => handleSelect(next)}
                helpText="How long this instance will run from now until automatic shutdown."
            >
                {presets.map((p) => (
                    <SingleSelectOption key={p.seconds} value={String(p.seconds)} label={p.label} />
                ))}
                <SingleSelectOption value={CUSTOM_VALUE} label={CUSTOM_LABEL} />
            </SingleSelectField>
            {customMode && (
                <>
                    <CustomDateCalendar date={calendarDate} minDate={moment(minDateMs).format(DATE_FORMAT)} onDateSelect={handleDate} />
                    {meta.error && <div className={styles.dateError}>{meta.error}</div>}
                </>
            )}
            {value > 0 && value !== originalTtl && !meta.error && (
                <div className={styles.willExpire}>Will expire on {moment(createdAtMs + value * 1000).format(DATETIME_FORMAT)}</div>
            )}
        </div>
    )
}
