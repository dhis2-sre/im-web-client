/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClusterVolume } from './ClusterVolume'
import type { UsageData } from './UsageData'

/**
 * Volume volume
 */
export type Volume = {
    ClusterVolume?: ClusterVolume
    /**
     * Date/Time the volume was created.
     */
    CreatedAt?: string
    /**
     * Name of the volume driver used by the volume.
     */
    Driver: string
    /**
     * User-defined key/value metadata.
     */
    Labels: Record<string, string>
    /**
     * Mount path of the volume on the host.
     */
    Mountpoint: string
    /**
     * Name of the volume.
     */
    Name: string
    /**
     * The driver specific options used when creating the volume.
     */
    Options: Record<string, string>
    /**
     * The level at which the volume exists. Either `global` for cluster-wide,
     * or `local` for machine level.
     */
    Scope: string
    /**
     * Low-level details about the volume, provided by the volume driver.
     * Details are returned as a map with key/value pairs:
     * `{"key":"value","key2":"value2"}`.
     *
     * The `Status` field is optional, and is omitted if the volume driver
     * does not support this feature.
     */
    Status?: Record<string, any>
    UsageData?: UsageData
}
