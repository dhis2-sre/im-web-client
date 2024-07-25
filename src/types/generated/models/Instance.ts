/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Group } from './Group'
import type { InstanceParameter } from './InstanceParameter'
import type { User } from './User'

export type Instance = {
    createdAt?: string
    deployLog?: string
    description?: string
    group?: Group
    groupName?: string
    id?: number
    name?: string
    parameters?: Array<InstanceParameter>
    preset?: boolean
    /**
     * The preset which this instance is created from
     */
    presetId?: number
    public?: boolean
    stackName?: string
    ttl?: number
    updatedAt?: string
    user?: User
    userId?: number
}
