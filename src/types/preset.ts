import type { EditDeploymentRequest, EditInstanceRequest } from './deployment-edit.ts'
import type { SaveInstanceRequest } from './generated/index.ts'

/* Hand-written types for the /presets resource, like deployment-edit.ts: the generated types don't carry them yet. */

export type SavePresetRequest = {
    name: string
    group: string
    description?: string
    ttl?: number
    instances: SaveInstanceRequest[]
}

export type EditPresetRequest = EditDeploymentRequest & { name?: string; group?: string }

export type CreateDeploymentFromPresetRequest = {
    name: string
    group?: string
    description?: string
    ttl?: number
    instances?: Record<string, EditInstanceRequest>
}

export type BulkDeployFromPresetRequest = Omit<CreateDeploymentFromPresetRequest, 'name'> & { prefix: string; count: number }
