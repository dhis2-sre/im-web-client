import type { Deployment } from '../../../types/index.ts'

/* Whether the deployment being edited already has an instance of the given stack. A companion
 * instance that exists but was never successfully deployed with credentials still counts as
 * existing: recovering a stuck deploy is a different problem from the one this answers. */
export const deploymentHasInstanceOf = (deployment: Deployment | undefined, stackName: string): boolean =>
    deployment?.instances?.some((instance) => instance.stackName === stackName) ?? false
