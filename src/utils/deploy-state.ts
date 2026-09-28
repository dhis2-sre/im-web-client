import { Deployment, DeploymentInstance, DeploymentInstanceDeployState } from '../types/index.ts'

/* A deploy holds the deployment's deploy lock for its whole duration and the backend refuses a
 * delete or an edit while it does, so anything offering one has to know it will be turned away. */
export const isDeploying = (deployment: Deployment) =>
    ((deployment.instances ?? []) as (DeploymentInstance & DeploymentInstanceDeployState)[]).some(
        (instance) => instance.deployStatus === 'pending' || instance.deployStatus === 'deploying'
    )

export const DEPLOYING_REFUSAL = 'This instance is deploying. Wait for the deploy to finish.'

/* A refusal carries its reason in the response body, as text, and saying that is what tells a user
 * the request was turned away rather than broken. Only a conflict is read this way: the body of a
 * 500 names a request id, and a gateway answering a 502 sends an HTML page, neither of which is
 * something to put in an alert. */
export const refusalMessage = (error: unknown, fallback: string) => {
    const response = (error as { response?: { status?: number; data?: unknown } })?.response
    if (response?.status !== 409) {
        return fallback
    }
    return typeof response.data === 'string' && response.data.trim() !== '' ? response.data : fallback
}
