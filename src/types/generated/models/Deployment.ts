/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */

import type { DeploymentInstance } from './DeploymentInstance'
import type { Group } from './Group'
import type { User } from './User'

export type Deployment = {
    createdAt?: string
    description?: string
    group?: Group
    groupName?: string
    id?: number
    instances?: Array<DeploymentInstance>
    name?: string
    public?: boolean
    ttl?: number
    updatedAt?: string
    user?: User
    userId?: number
}
