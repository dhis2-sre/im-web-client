/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InstanceOptionalParameter } from './InstanceOptionalParameter'
import type { InstanceRequiredParameter } from './InstanceRequiredParameter'

export type DeployInstanceRequest = {
    description?: string
    groupName?: string
    name?: string
    optionalParameters?: Array<InstanceOptionalParameter>
    presetInstance?: number
    public?: boolean
    requiredParameters?: Array<InstanceRequiredParameter>
    sourceInstance?: number
    stackName?: string
    ttl?: number
}
