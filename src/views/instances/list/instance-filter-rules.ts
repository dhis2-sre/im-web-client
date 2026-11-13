import type { Deployment } from '../../../types/index.ts'
import { DAY_IN_SECONDS } from '../fields/ttl-presets.ts'
import type { DeploymentHealth } from './component-health.ts'

/* The Instances list's filter rules, kept apart from the components that use them so they can be
 * tested without a DOM. */

export type Filters = { search: string; group: string; status: 'all' | DeploymentHealth; expiringSoon: boolean }

/* Each filter's place in the URL. A filter at its default is left out, so a plain list has a plain address. */
export const PARAMS: Record<keyof Filters, string> = { search: 'q', group: 'group', status: 'status', expiringSoon: 'expiring' }
const HEALTHS: string[] = ['healthy', 'errors', 'pending']

export const readFilters = (params: URLSearchParams): Filters => {
    const status = params.get(PARAMS.status) ?? ''
    return {
        search: params.get(PARAMS.search) ?? '',
        group: params.get(PARAMS.group) ?? 'all',
        status: HEALTHS.includes(status) ? (status as DeploymentHealth) : 'all',
        expiringSoon: params.get(PARAMS.expiringSoon) === '1',
    }
}

export const isDefault = (key: keyof Filters, value: Filters[keyof Filters]) =>
    value === '' || value === false || (key === 'group' && value === 'all') || (key === 'status' && value === 'all')

const EXPIRING_SOON_SECONDS = DAY_IN_SECONDS

export const expiresAt = (deployment: Deployment) => new Date(deployment.createdAt).getTime() + deployment.ttl * 1000

/* Under a day left. The cell marks only the viewer's own; the list's filter finds anyone's. */
export const isExpiringSoon = (deployment: Deployment, now: number) => {
    const remaining = (expiresAt(deployment) - now) / 1000
    return remaining > 0 && remaining < EXPIRING_SOON_SECONDS
}
