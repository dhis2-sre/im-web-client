import { CalendarInput } from '@dhis2/ui'
import { FC } from 'react'
import styles from './fields.module.css'

type Props = {
    date: string
    minDate?: string
    onDateSelect: (calendarDateString: string) => void
}

// Use 'gregory' not 'iso8601': @js-temporal/polyfill returns "" for toLocaleString({calendar:'iso8601', month:'long'}),
// so @dhis2/ui's <select value={currMonth.label}> falls back to its first option ("January") regardless of the actual visible month.
export const CustomDateCalendar: FC<Props> = ({ date, minDate, onDateSelect }) => (
    <div className={styles.calendarContainer}>
        <CalendarInput calendar="gregory" date={date} minDate={minDate} onDateSelect={(d: { calendarDateString: string }) => onDateSelect(d.calendarDateString)} />
    </div>
)
