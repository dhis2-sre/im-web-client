import { colors, IconSearch16, Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import styles from './filter-fields.module.css'

/* The search and selects at the start of a list's filter bar, a little closer together than the bar's
 * checkboxes, as one set of fields. */
export const FilterFields: FC<{ children: ReactNode }> = ({ children }) => <div className={styles.fields}>{children}</div>

/* The same box on every list. The label names what is searched, for screen readers. Input rather than
 * InputField, which drops the accessible name. Its types lag the component, leaving ariaLabel out and
 * taking prefixIcon for a DOM element, so both go in through an untyped spread. The icon's colour is a
 * value rather than a CSS variable, which an SVG attribute can't resolve. */
export const SearchFilter: FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => {
    const untyped: Record<string, unknown> = { ariaLabel: label, prefixIcon: <IconSearch16 color={colors.grey600} /> }
    return <Input dense {...untyped} placeholder="Search by name" value={value} onChange={({ value: next }) => onChange(next ?? '')} className={styles.search} />
}

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
