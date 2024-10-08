/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ClusterConfiguration } from './ClusterConfiguration'
import type { User } from './User'

/**
 * Group domain object defining a group
 */
export type Group = {
    adminUsers?: Array<User>
    clusterConfiguration?: ClusterConfiguration
    createdAt?: string
    deployable?: boolean
    hostname?: string
    description?: string
    name?: string
    updatedAt?: string
    users?: Array<User>
}
