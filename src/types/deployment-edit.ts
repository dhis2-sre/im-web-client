/* Hand-written types for editing a deployment (available from im-manager version-3.0).
 * Regenerate-and-replace once the 3.0 swagger is published to the API the generated types are built from. */

/* The change requested for one instance. Absent means unchanged, so a form sends only what the user
 * touched and a sensitive value left blank keeps whatever the instance already holds. */
export type EditInstanceRequest = {
    parameters?: Record<string, { value: string }>
    public?: boolean
}

/* A diff against the deployment, keyed by stack name. Turning the parameter that gates a companion
 * on or off is how a companion is added or removed; there is no separate gesture for it. */
export type EditDeploymentRequest = {
    description?: string
    ttl?: number
    instances?: Record<string, EditInstanceRequest>
}
