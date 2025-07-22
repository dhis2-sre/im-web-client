/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Deployment } from './Deployment'
import type { DeploymentInstanceParameters } from './DeploymentInstanceParameters'
import type { Group } from './Group'
import type { Lock } from './Lock'
export type DeploymentInstance = {
    Lock?: Lock
    createdAt?: string
    deployLog?: string
    deployment?: Deployment
    deploymentId?: number
    group?: Group
    groupName?: string
    id?: number
    /**
     * TODO: FK to name of Deployment?
     */
    name?: string
    parameters?: DeploymentInstanceParameters
    public?: boolean
    /**
     * Stack     *Stack `json:"stack,omitempty"`
     */
    stackName?: string
    updatedAt?: string
}
