import { SingleSelectField, SingleSelectOption, CalendarInput } from '@dhis2/ui'
import React, { useState } from 'react'
import { useField } from 'react-final-form'
import styles from './fields.module.css'

const defaultTTL = 60 * 60 * 24
const options = [
    { label: '1 hour', value: (60 * 60).toString() },
    { label: '6 hours', value: (60 * 60 * 6).toString() },
    { label: '12 hours', value: (60 * 60 * 12).toString() },
    { label: '1 day', value: defaultTTL.toString() },
    { label: '2 days', value: (60 * 60 * 24 * 2).toString() },
    { label: '5 days', value: (60 * 60 * 24 * 5).toString() },
    { label: '1 week', value: (60 * 60 * 24 * 7).toString() },
    { label: '2 weeks', value: (60 * 60 * 24 * 7 * 2).toString() },
    { label: '1 month', value: (60 * 60 * 24 * 7 * 4).toString() },
    { label: 'Custom', value: '-1' },
]

export const TtlSelect = () => {
    const { input: ttlInput } = useField('ttl', { subscription: { value: true } })
    const [selectedValue, setSelectedValue] = useState(ttlInput.value.toString())
    const [showCalendar, setShowCalendar] = useState(false)
    const [calendarDate, setCalendarDate] = useState('')

    const handleSelectChange = (value: string) => {
        setSelectedValue(value)
        if (value === '-1') {
            setShowCalendar(true)
        } else {
            ttlInput.onChange(parseInt(value, 10))
            setShowCalendar(false)
        }
    }

    const handleCustomDateChange = (date) => {
        const currentDate = new Date()
        const targetDate = new Date(date.calendarDateString + 'T00:00:00Z')
        const differenceInMs = targetDate.getTime() - currentDate.getTime()

        const differenceInSeconds = Math.floor(differenceInMs / 1000)
        ttlInput.onChange(differenceInSeconds)
        setSelectedValue('-1')
        setCalendarDate(targetDate.toISOString().split('T')[0])
    }

    return (
        <div>
            <SingleSelectField
                className={styles.field}
                label="Lifetime"
                selected={selectedValue}
                onChange={({ selected }: { selected: string }) => handleSelectChange(selected)}
                helpText="How long this instance will run for until automatic shutdown."
            >
                {options.map((option) => (
                    <SingleSelectOption key={option.value} label={option.label} value={option.value} />
                ))}
            </SingleSelectField>
            {showCalendar && (
                <div className={styles.calenderContainer}>
                    <CalendarInput onDateSelect={handleCustomDateChange} calendar="iso8601" date={calendarDate} />
                </div>
            )}
        </div>
    )
}
