/* Hand-written types for asynchronous deploys (available from im-manager version-3.0).
 * Regenerate-and-replace once the 3.0 swagger is published to the API the generated types are built from. */

export type DeployStatus = 'pending' | 'deploying' | 'deployed' | 'failed'

/* The deploy state every deployment instance carries. */
export type DeploymentInstanceDeployState = {
    deployStatus?: DeployStatus
    deployedAt?: string
    deployError?: string
}

/* An event published while a deployment deploys. Events carrying an instanceId are that instance's
 * progress and are not persisted; the one without is the outcome of the deploy as a whole. */
export type DeploymentEventData = {
    status: 'started' | 'success' | 'error'
    deploymentId: number
    deploymentName: string
    instanceId?: number
    stackName?: string
    error?: string
}
