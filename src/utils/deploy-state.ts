import { Deployment, DeploymentInstance, DeploymentInstanceDeployState } from '../types/index.ts'

/* A deploy holds the deployment's deploy lock for its whole duration and the backend refuses a
 * delete or an edit while it does, so anything offering one has to know it will be turned away. */
export const isDeploying = (deployment: Deployment) =>
    ((deployment.instances ?? []) as (DeploymentInstance & DeploymentInstanceDeployState)[]).some(
        (instance) => instance.deployStatus === 'pending' || instance.deployStatus === 'deploying'
    )

export const DEPLOYING_REFUSAL = 'This instance is deploying. Wait for the deploy to finish.'

/* The API reports why it refused in the response body, as text. Preferring it to a message written
 * here is what tells a user that a delete was refused rather than broken. */
export const serverMessage = (error: unknown, fallback: string) => {
    const data = (error as { response?: { data?: unknown } })?.response?.data
    return typeof data === 'string' && data.trim() !== '' ? data : fallback
}
