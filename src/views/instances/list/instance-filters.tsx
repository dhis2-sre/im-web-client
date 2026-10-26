import { Button, Checkbox, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import { useCallback, useMemo, useState } from 'react'
import type { FC } from 'react'
import { FilterFields, GroupFilter, OnlyMineFilter, SearchFilter, useOnlyMine, useSavedSearchParams } from '../../../components/index.ts'
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

const STATUS_OPTIONS: { value: Filters['status']; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'errors', label: 'Has errors' },
    { value: 'pending', label: 'Pending' },
]

/* The Instances list's filters, kept in the URL and remembered for the tab (see useSavedSearchParams).
 * "Only mine" stays in the browser instead, since in a shared link it would mean whoever opened it. */
export const useInstanceFilters = () => {
    const { params, setParams } = useSavedSearchParams('instanceFilters')
    const filters = useMemo(() => readFilters(params), [params])
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyInstances')
    // shortcut: the clock is read once when the list mounts, so "expiring soon" doesn't move while the page stays open; tick it if that matters.
    const [now] = useState(Date.now)

    /* Replacing rather than pushing, like useSavedSearchParams' own setter, but several filters at once. */
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
            <FilterFields>
                <SearchFilter label="Search instances" value={filters.search} onChange={(value) => set({ search: value })} />
                <GroupFilter groups={groupNames} selected={filters.group === 'all' ? null : filters.group} onChange={(value) => set({ group: value ?? 'all' })} />
                <SingleSelect dense prefix="Status" selected={filters.status} onChange={({ selected }) => set({ status: selected as Filters['status'] })} className={styles.select}>
                    {STATUS_OPTIONS.map((option) => (
                        <SingleSelectOption key={option.value} value={option.value} label={option.label} />
                    ))}
                </SingleSelect>
            </FilterFields>
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
