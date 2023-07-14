/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClusterConfiguration } from './ClusterConfiguration'
import type { User } from './User'

/**
 * Group domain object defining a group
 */
export type Group = {
    clusterConfiguration?: ClusterConfiguration
    createdAt?: string
    deployable?: boolean
    hostname?: string
    name?: string
    updatedAt?: string
    users?: Array<User>
}
