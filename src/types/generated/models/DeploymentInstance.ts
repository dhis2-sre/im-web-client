/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

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
     * TODO: Delete name and group... Or at least don't persist
     * TODO: Don't return the name
     * ... Just delete both Name, Group and GroupName?
     */
    name?: string
    parameters?: DeploymentInstanceParameters
    /**
     * Stack     *Stack `json:"stack,omitempty"`
     */
    stackName?: string
    status?: string
    updatedAt?: string
}
