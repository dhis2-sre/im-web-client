/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Deployment } from './Deployment'
import type { DeploymentInstanceParameters } from './DeploymentInstanceParameters'
import type { Group } from './Group'

export type DeploymentInstance = {
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
    /**
     * Stack     *Stack `json:"stack,omitempty"`
     */
    stackName?: string
    updatedAt?: string
}
