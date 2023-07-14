/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * GraphDriverData Information about the storage driver used to store the container's and
 * image's filesystem.
 */
export type GraphDriverData = {
    /**
     * Low-level storage metadata, provided as key/value pairs.
     *
     * This information is driver-specific, and depends on the storage-driver
     * in use, and should be used for informational purposes only.
     */
    Data: Record<string, string>
    /**
     * Name of the storage driver.
     */
    Name: string
}
