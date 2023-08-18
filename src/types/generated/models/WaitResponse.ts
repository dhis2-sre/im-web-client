/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WaitExitError } from './WaitExitError'

/**
 * OK response to ContainerWait operation
 */
export type WaitResponse = {
    Error?: WaitExitError
    /**
     * Exit code of the container
     */
    StatusCode: number
}
