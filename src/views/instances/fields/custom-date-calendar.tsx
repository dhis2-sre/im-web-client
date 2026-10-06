import { CalendarInput } from '@dhis2/ui'
import { ComponentProps, FC } from 'react'
import styles from './fields.module.css'

type Props = {
    date: string
    minDate?: string
    onDateSelect: (calendarDateString: string) => void
}

// CalendarInput honours minDate at runtime: it declares it in propTypes and forwards it to the date
// picker as minDateString. Only @dhis2-ui/calendar's type declaration leaves it out, so it is
// declared here rather than dropping a lower bound that works.
const CalendarInputWithMinDate = CalendarInput as FC<ComponentProps<typeof CalendarInput> & { minDate?: string }>

// Use 'gregory' not 'iso8601': @js-temporal/polyfill returns "" for toLocaleString({calendar:'iso8601', month:'long'}),
// so @dhis2/ui's <select value={currMonth.label}> falls back to its first option ("January") regardless of the actual visible month.
export const CustomDateCalendar: FC<Props> = ({ date, minDate, onDateSelect }) => (
    <div className={styles.calendarContainer}>
        <CalendarInputWithMinDate calendar="gregory" date={date} minDate={minDate} onDateSelect={(d: { calendarDateString: string }) => onDateSelect(d.calendarDateString)} />
    </div>
)
