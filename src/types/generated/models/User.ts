/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

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
