import { Button, IconAdd24 } from '@dhis2/ui'
import { createContext, memo, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { ListPage } from '../../../components/index.ts'
import type { ListColumn } from '../../../components/index.ts'
import { createEmitter } from '../../../hooks/create-emitter.ts'
import { useLiveComponents } from '../../../hooks/index.ts'
import type { LiveComponents } from '../../../hooks/use-live-components.ts'
import type { Deployment } from '../../../types/index.ts'
import { deploymentHealth } from './component-health.ts'
import { DeploymentComponentTags } from './deployment-component-tags.tsx'
import { ExpiresCell } from './expires-cell.tsx'
import { InstanceActionsMenu } from './instance-actions-menu.tsx'
import { InstanceFilterBar, useInstanceFilters } from './instance-filters.tsx'
import { OpenButton } from './open-button.tsx'
import { useDeployments } from './use-deployments.ts'

type RowStatus = Pick<LiveComponents, 'instances' | 'loading' | 'error' | 'stale' | 'refetch'>

/* The deployments' components, kept by the list rather than by each row, so the status filter knows
 * the health of rows it is hiding. The status chip and the actions menu read the same entry. A store
 * rather than list state, so one deployment's change re-renders its own row and not all of them. */
const createStatusStore = () => {
    const statuses = new Map<number, RowStatus>()
    const changes = createEmitter<number>()
    return {
        get: (id: number) => statuses.get(id),
        set: (id: number, status: RowStatus) => {
            statuses.set(id, status)
            changes.emit(id)
        },
        subscribe: changes.subscribe,
    }
}
const Statuses = createContext(createStatusStore())

const useRowStatus = (id: number) => {
    const store = useContext(Statuses)
    return useSyncExternalStore(store.subscribe, () => store.get(id))
}

/* Loads one deployment's components, live, and reports them to the list. One per deployment in scope
 * (see inScope), mounted whatever the search and status filters show, so typing never refetches. */
const LoadStatus: FC<{ id: number }> = ({ id }) => {
    const store = useContext(Statuses)
    const { instances, loading, error, stale, refetch } = useLiveComponents(id, { reloadOnReconnect: false })
    useEffect(() => store.set(id, { instances, loading, error, stale, refetch }), [store, id, instances, loading, error, stale, refetch])
    return null
}
// Memoised so a reload of the list doesn't re-render every loader with it.
const StatusLoader = memo(LoadStatus)

const StatusCell: FC<{ id: number }> = ({ id }) => {
    const status = useRowStatus(id)
    const cell = useRef<HTMLDivElement>(null)

    /* After a reconnect that could not resume, a row reloads once it is on screen, so the list doesn't
     * reload every deployment at once. */
    useEffect(() => {
        const element = cell.current
        if (!status?.stale || !element) {
            return
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                observer.disconnect()
                status.refetch()
            }
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [status])

    return (
        <div ref={cell}>
            <DeploymentComponentTags instances={status?.instances} loading={status?.loading ?? true} error={status?.error} />
        </div>
    )
}

const RowActions: FC<{ deployment: Deployment; refetch: () => void }> = ({ deployment, refetch }) => {
    const status = useRowStatus(deployment.id)

    return (
        <>
            <OpenButton group={deployment.group} name={deployment.name} />
            <InstanceActionsMenu deployment={deployment} components={status?.instances} onChanged={refetch} onDeleted={refetch} />
        </>
    )
}

const columns: ListColumn<Deployment>[] = [
    { key: 'name', label: 'Name', render: (deployment) => deployment.name, sortValue: (deployment) => deployment.name, breakAnywhere: true },
    { key: 'status', label: 'Status', render: (deployment) => <StatusCell id={deployment.id} /> },
    {
        key: 'expires',
        label: 'Expires',
        render: (deployment) => <ExpiresCell deployment={deployment} />,
        sortValue: (deployment) => new Date(deployment.createdAt).getTime() + deployment.ttl * 1000,
        nowrap: true,
    },
    { key: 'owner', label: 'Owner', render: (deployment) => deployment.user.email, sortValue: (deployment) => deployment.user.email, breakAnywhere: true },
    { key: 'updated', label: 'Updated', render: (deployment) => <Moment date={deployment.updatedAt} fromNow />, sortValue: (deployment) => deployment.updatedAt, nowrap: true },
]

export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const { groups, error, loading, refetch } = useDeployments()
    const refresh = () => void refetch()
    const filters = useInstanceFilters()

    const [store] = useState(createStatusStore)

    const all = groups?.flatMap((group) => group.deployments ?? []) ?? []
    const inScope = all.filter(filters.inScope)
    const health = (deployment: Deployment) => {
        const components = store.get(deployment.id)?.instances
        return components ? deploymentHealth(components) : undefined
    }
    const countChecking = () => inScope.filter((deployment) => store.get(deployment.id)?.loading !== false).length
    /* Only a status filter needs the list itself to follow the statuses, to show and hide rows by them;
     * otherwise a change re-renders just its own row. */
    useSyncExternalStore(store.subscribe, () => (filters.filters.status === 'all' ? '' : `${countChecking()} ${inScope.map(health).join()}`))
    const shown = groups
        ?.map((group) => ({
            key: group.name ?? '',
            title: group.name ?? '',
            rows: (group.deployments ?? []).filter((deployment) => filters.matches(deployment, health(deployment))),
        }))
        .filter((group) => group.rows.length > 0)
    const checking = countChecking()

    return (
        <Statuses.Provider value={store}>
            {inScope.map((deployment) => (
                <StatusLoader key={deployment.id} id={deployment.id} />
            ))}
            <ListPage
                title="Instances"
                actions={
                    <Button primary icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                        New instance
                    </Button>
                }
                filters={<InstanceFilterBar state={filters} groupNames={groups?.map((group) => group.name ?? '') ?? []} checking={checking} />}
                columns={columns}
                groups={shown}
                rowKey={(deployment) => deployment.id}
                rowHref={(deployment) => `/instances/${deployment.id}/details`}
                renderRowActions={(deployment) => <RowActions deployment={deployment} refetch={refresh} />}
                loading={loading}
                error={error ? { title: 'Could not retrieve instances', description: error.message } : undefined}
                empty={
                    filters.active && all.length > 0
                        ? {
                              title: 'No matching instances',
                              action: (
                                  <Button small secondary onClick={filters.clear}>
                                      Clear filters
                                  </Button>
                              ),
                          }
                        : { title: 'No instances' }
                }
            />
        </Statuses.Provider>
    )
}
