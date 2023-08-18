/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * TypeMount contains options for using a volume as a Mount-type
 * volume.
 */
export type TypeMount = {
    /**
     * FsType specifies the filesystem type for the mount volume. Optional.
     */
    FsType?: string
    /**
     * MountFlags defines flags to pass when mounting the volume. Optional.
     */
    MountFlags?: Array<string>
}
