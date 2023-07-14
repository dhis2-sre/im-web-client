/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Instance } from './Instance'
import type { StackOptionalParameter } from './StackOptionalParameter'
import type { StackRequiredParameter } from './StackRequiredParameter'

export type Stack = {
    createdAt?: string
    hostnamePattern?: string
    hostnameVariable?: string
    instances?: Array<Instance>
    name?: string
    optionalParameters?: Array<StackOptionalParameter>
    requiredParameters?: Array<StackRequiredParameter>
    updatedAt?: string
}
