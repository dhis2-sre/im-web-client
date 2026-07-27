/* Hand-written types for GET /instances/:id/components (available from im-manager version-3.0).
 * Regenerate-and-replace once the 3.0 swagger is published to the API the generated types are built from. */

export type InstanceComponentReplica = {
    name: string
    phase: string
    ready: boolean
    restarts: number
    createdAt: string
}

export type InstanceComponent = {
    name: string
    supportedOperations: string[]
    replicas: InstanceComponentReplica[]
}
