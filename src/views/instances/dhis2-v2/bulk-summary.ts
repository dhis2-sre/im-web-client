import type { AnyObject } from 'final-form'
import type { ClusterResources } from '../../../types/index.ts'

const UNIT_BYTES: Record<string, number> = {
    '': 1,
    'K': 1e3,
    'M': 1e6,
    'G': 1e9,
    'T': 1e12,
    'Ki': 1024,
    'Mi': 1024 ** 2,
    'Gi': 1024 ** 3,
    'Ti': 1024 ** 4,
}
const BUSY_PERCENT = 70

/* A Kubernetes quantity such as 20Gi or 1536Mi in Gi. Anything unreadable counts as zero. */
export const toGi = (quantity: unknown): number => {
    const match = /^(\d+(?:\.\d+)?)([KMGT]i?)?$/.exec(String(quantity ?? '').trim())
    return match ? (Number(match[1]) * UNIT_BYTES[match[2] ?? '']) / UNIT_BYTES.Gi : 0
}

export const formatGi = (gi: number): string => (gi >= 1024 ? `${(gi / 1024).toFixed(1)} Ti` : `${gi.toFixed(1)} Gi`)

/* Disk is the database plus the file store; memory is what the core and database ask for, plus Doris when it is on. */
export const perInstanceResources = (values: AnyObject): { disk: number; memory: number } => {
    const main: AnyObject = values['dhis2-v2'] ?? {}
    const fileStore = main.STORAGE_TYPE === 'minio' ? main.MINIO_STORAGE_SIZE : main.STORAGE_TYPE === 'filesystem' ? main.FILESYSTEM_VOLUME_SIZE : undefined
    const memory = [
        'CORE_RESOURCES_REQUESTS_MEMORY',
        'DB_RESOURCES_REQUESTS_MEMORY',
        ...(main.ENABLE_DORIS === 'true' ? ['DORIS_FRONTEND_RESOURCES_REQUESTS_MEMORY', 'DORIS_BACKEND_RESOURCES_REQUESTS_MEMORY'] : []),
    ]
    return { disk: toGi(main.DATABASE_SIZE) + toGi(fileStore), memory: memory.reduce((total, name) => total + toGi(main[name]), 0) }
}

export const isBusy = (resources?: ClusterResources): boolean =>
    !!resources && !resources.Autoscaled && (parseFloat(resources.CPU ?? '') >= BUSY_PERCENT || parseFloat(resources.Memory ?? '') >= BUSY_PERCENT)

/* Up to three names in full, then how many more, so a long list stays one line. */
export const listNames = (names: string[]): string => {
    if (names.length > 3) {
        return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`
    }
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : (names[0] ?? '')
}
