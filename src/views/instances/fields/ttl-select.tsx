import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useState } from 'react'
import { useField } from 'react-final-form'
import { CustomDateCalendar } from './custom-date-calendar.tsx'
import styles from './fields.module.css'
import { CUSTOM_LABEL, CUSTOM_VALUE, TTL_PRESETS } from './ttl-presets.ts'

export const TtlSelect = () => {
    const { input } = useField<number>('ttl', { subscription: { value: true } })
    const [customMode, setCustomMode] = useState(false)
    const [calendarDate, setCalendarDate] = useState('')

    const value = Number(input.value) || 0
    const matchedPreset = TTL_PRESETS.find((p) => p.seconds === value)
    const selected = customMode ? CUSTOM_VALUE : matchedPreset ? String(matchedPreset.seconds) : ''

    const handleSelectChange = (next: string) => {
        if (next === CUSTOM_VALUE) {
            setCustomMode(true)
        } else {
            setCustomMode(false)
            setCalendarDate('')
            input.onChange(parseInt(next, 10))
        }
    }

    const handleDate = (s: string) => {
        input.onChange(Math.floor((new Date(`${s}T00:00:00Z`).getTime() - Date.now()) / 1000))
        setCalendarDate(s)
    }

    return (
        <div>
            <SingleSelectField
                className={styles.field}
                label="Lifetime"
                selected={selected}
                onChange={({ selected: next }: { selected: string }) => handleSelectChange(next)}
                helpText="How long this instance will run for until automatic shutdown."
            >
                {TTL_PRESETS.map((p) => (
                    <SingleSelectOption key={p.seconds} label={p.label} value={String(p.seconds)} />
                ))}
                <SingleSelectOption label={CUSTOM_LABEL} value={CUSTOM_VALUE} />
            </SingleSelectField>
            {customMode && <CustomDateCalendar date={calendarDate} onDateSelect={handleDate} />}
        </div>
    )
}
