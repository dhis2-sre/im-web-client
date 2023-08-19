/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InstanceParameter } from './InstanceParameter'

export type DeployInstanceRequest = {
    description?: string
    groupName?: string
    name?: string
    parameters?: Array<InstanceParameter>
    presetInstance?: number
    public?: boolean
    sourceInstance?: number
    stackName?: string
    ttl?: number
}
