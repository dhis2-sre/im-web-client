/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Group } from './Group'
import type { InstanceOptionalParameter } from './InstanceOptionalParameter'
import type { InstanceRequiredParameter } from './InstanceRequiredParameter'
import type { User } from './User'

export type Instance = {
    createdAt?: string
    deployLog?: string
    description?: string
    group?: Group
    groupName?: string
    id?: number
    name?: string
    optionalParameters?: Array<InstanceOptionalParameter>
    preset?: boolean
    presetId?: number
    public?: boolean
    requiredParameters?: Array<InstanceRequiredParameter>
    stackName?: string
    ttl?: number
    updatedAt?: string
    user?: User
    userId?: number
}
