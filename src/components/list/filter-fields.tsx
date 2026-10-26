import { Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import styles from './filter-fields.module.css'

/* The search and selects at the start of a list's filter bar, a little closer together than the bar's
 * checkboxes, as one set of fields. */
export const FilterFields: FC<{ children: ReactNode }> = ({ children }) => <div className={styles.fields}>{children}</div>

/* Input rather than InputField, which drops the accessible name. Its types lag the component and leave
 * ariaLabel out, so it goes in by spread. */
export const SearchFilter: FC<{ label: string; placeholder: string; value: string; onChange: (value: string) => void }> = ({ label, placeholder, value, onChange }) => (
    <Input dense {...{ ariaLabel: label }} placeholder={placeholder} value={value} onChange={({ value: next }) => onChange(next ?? '')} className={styles.search} />
)

/* One group, or every group when nothing is selected. A group a link names that the list doesn't have
 * is offered too, so the select always shows what is filtering. */
export const GroupFilter: FC<{ groups: string[]; selected: string | null; onChange: (group: string | null) => void }> = ({ groups, selected, onChange }) => (
    <SingleSelect dense prefix="Group" selected={selected ?? 'all'} onChange={({ selected: next }) => onChange(next === 'all' ? null : next)} className={styles.select}>
        <SingleSelectOption value="all" label="All" />
        {(selected && !groups.includes(selected) ? [...groups, selected] : groups).map((name) => (
            <SingleSelectOption key={name} value={name} label={name} />
        ))}
    </SingleSelect>
)
