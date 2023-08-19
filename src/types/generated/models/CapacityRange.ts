/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * CapacityRange describes the minimum and maximum capacity a volume should be
 * created with
 */
export type CapacityRange = {
    /**
     * LimitBytes specifies that a volume must not be bigger than this. The
     * value of 0 indicates an unspecified maximum
     */
    LimitBytes?: number
    /**
     * RequiredBytes specifies that a volume must be at least this big. The
     * value of 0 indicates an unspecified minimum.
     */
    RequiredBytes?: number
}
