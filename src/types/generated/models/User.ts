/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { Group } from './Group'
/**
 * User domain object defining a user
 */
export type User = {
    adminGroups?: Array<Group>
    createdAt?: string
    email?: string
    groups?: Array<Group>
    id?: number
    updatedAt?: string
    validated?: boolean
}
