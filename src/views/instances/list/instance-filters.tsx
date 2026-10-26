import { Button, Checkbox, Input, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import { OnlyMineFilter, useOnlyMine } from '../../../components/index.ts'
import type { Deployment } from '../../../types/index.ts'
import type { DeploymentHealth } from './component-health.ts'
import { isExpiringSoon } from './expires-cell.tsx'
import styles from './instance-filters.module.css'

type Filters = { search: string; group: string; status: 'all' | DeploymentHealth; expiringSoon: boolean }

/* Each filter's place in the URL. A filter at its default is left out, so a plain list has a plain address. */
const PARAMS: Record<keyof Filters, string> = { search: 'q', group: 'group', status: 'status', expiringSoon: 'expiring' }
const HEALTHS: string[] = ['healthy', 'errors', 'pending']

const readFilters = (params: URLSearchParams): Filters => {
    const status = params.get(PARAMS.status) ?? ''
    return {
        search: params.get(PARAMS.search) ?? '',
        group: params.get(PARAMS.group) ?? 'all',
        status: HEALTHS.includes(status) ? (status as DeploymentHealth) : 'all',
        expiringSoon: params.get(PARAMS.expiringSoon) === '1',
    }
}

const isDefault = (key: keyof Filters, value: Filters[keyof Filters]) =>
    value === '' || value === false || (key === 'group' && value === 'all') || (key === 'status' && value === 'all')

/* The tab's last filters, so a plain link to the list (the sidebar, a breadcrumb) comes back to them.
 * Per tab rather than for good, so a filter doesn't quietly linger into another day's work. */
const SAVED_FILTERS_KEY = 'instanceFilters'

const readSavedFilters = () => {
    try {
        return sessionStorage.getItem(SAVED_FILTERS_KEY) ?? ''
    } catch {
        return ''
    }
}

const saveFilters = (query: string) => {
    try {
        sessionStorage.setItem(SAVED_FILTERS_KEY, query)
    } catch {
        // Without storage the filters last only as long as the address, which is no reason to fail.
    }
}

const STATUS_OPTIONS: { value: Filters['status']; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'errors', label: 'Has errors' },
    { value: 'pending', label: 'Pending' },
]

/* The Instances list's filters, kept in the URL so they survive leaving the page and a filtered list can
 * be shared as a link. "Only mine" stays in the browser instead, since in a shared link it would mean
 * whoever opened it. */
export const useInstanceFilters = () => {
    const [params, setParams] = useSearchParams()
    const filters = useMemo(() => readFilters(params), [params])

    /* Arriving with no filters in the address brings back the tab's last ones, before the first paint so
     * the unfiltered list never flashes. A link that names filters wins, and becomes the saved ones. */
    useLayoutEffect(() => {
        const saved = readSavedFilters()
        if (params.size === 0 && saved) {
            setParams(saved, { replace: true })
        }
        // Only on arrival: after that, an empty address means the filters were cleared.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => saveFilters(params.toString()), [params])
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyInstances')
    // shortcut: the clock is read once when the list mounts, so "expiring soon" doesn't move while the page stays open; tick it if that matters.
    const [now] = useState(Date.now)

    /* Replacing rather than pushing, so typing a search doesn't leave a history entry per letter. */
    const set = useCallback(
        (change: Partial<Filters>) =>
            setParams(
                (current) => {
                    const next = new URLSearchParams(current)
                    for (const [key, value] of Object.entries(change) as [keyof Filters, Filters[keyof Filters]][]) {
                        if (isDefault(key, value)) {
                            next.delete(PARAMS[key])
                        } else {
                            next.set(PARAMS[key], value === true ? '1' : String(value))
                        }
                    }
                    return next
                },
                { replace: true }
            ),
        [setParams]
    )
    const clear = useCallback(() => {
        set({ search: '', group: 'all', status: 'all', expiringSoon: false })
        setOnlyMine(false)
    }, [set, setOnlyMine])
    const active = onlyMine || filters.search.trim() !== '' || filters.group !== 'all' || filters.status !== 'all' || filters.expiringSoon

    /* A deployment whose components haven't loaded has no health yet, so a status filter leaves it out
     * until they arrive. */
    const matches = useCallback(
        (deployment: Deployment, health: DeploymentHealth | undefined) => {
            const search = filters.search.trim().toLowerCase()
            if (search && ![deployment.name, deployment.user?.email, deployment.description].some((text) => text?.toLowerCase().includes(search))) {
                return false
            }
            return (
                isShown(deployment.user) &&
                (filters.group === 'all' || deployment.groupName === filters.group) &&
                (filters.status === 'all' || health === filters.status) &&
                (!filters.expiringSoon || isExpiringSoon(deployment, now))
            )
        },
        [filters, isShown, now]
    )

    return { filters, set, clear, active, onlyMine, setOnlyMine, matches }
}

/* The options, plus the selected one if a link names something the list doesn't have (yet): the select
 * has to show what is filtering the list. */
const withSelected = (names: string[], selected: string, none: string) => (selected === none || names.includes(selected) ? names : [...names, selected])

type InstanceFilterBarProps = {
    state: ReturnType<typeof useInstanceFilters>
    groupNames: string[]
    /* How many deployments still have no health, shown while a status filter waits on them. */
    checking: number
}

export const InstanceFilterBar: FC<InstanceFilterBarProps> = ({ state, groupNames, checking }) => {
    const { filters, set, clear, active, onlyMine, setOnlyMine } = state

    return (
        <>
            <div className={styles.fields}>
                {/* Input rather than InputField, which drops the accessible name. Its types lag the component and
                 * leave ariaLabel out, so it goes in by spread. */}
                <Input
                    dense
                    {...{ ariaLabel: 'Search instances' }}
                    placeholder="Search name, owner or description…"
                    value={filters.search}
                    onChange={({ value }) => set({ search: value ?? '' })}
                    className={styles.search}
                />
                <SingleSelect dense prefix="Group" selected={filters.group} onChange={({ selected }) => set({ group: selected })} className={styles.select}>
                    <SingleSelectOption value="all" label="All" />
                    {withSelected(groupNames, filters.group, 'all').map((name) => (
                        <SingleSelectOption key={name} value={name} label={name} />
                    ))}
                </SingleSelect>
                <SingleSelect dense prefix="Status" selected={filters.status} onChange={({ selected }) => set({ status: selected as Filters['status'] })} className={styles.select}>
                    {STATUS_OPTIONS.map((option) => (
                        <SingleSelectOption key={option.value} value={option.value} label={option.label} />
                    ))}
                </SingleSelect>
            </div>
            <Checkbox dense label="Expiring soon" checked={filters.expiringSoon} onChange={({ checked }) => set({ expiringSoon: checked })} />
            <OnlyMineFilter checked={onlyMine} onChange={setOnlyMine} />
            {filters.status !== 'all' && checking > 0 && <span className={styles.checking}>Checking the status of {checking} more…</span>}
            {active && (
                <Button small secondary onClick={clear}>
                    Clear filters
                </Button>
            )}
        </>
    )
}
