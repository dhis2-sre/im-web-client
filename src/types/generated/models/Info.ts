/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Topology } from './Topology'

/**
 * Info contains information about the Volume as a whole as provided by
 * the CSI storage plugin.
 */
export type Info = {
    /**
     * AccessibleTopolgoy is the topology this volume is actually accessible
     * from.
     */
    AccessibleTopology?: Array<Topology>
    /**
     * CapacityBytes is the capacity of the volume in bytes. A value of 0
     * indicates that the capacity is unknown.
     */
    CapacityBytes?: number
    /**
     * VolumeContext is the context originating from the CSI storage plugin
     * when the Volume is created.
     */
    VolumeContext?: Record<string, string>
    /**
     * VolumeID is the ID of the Volume as seen by the CSI storage plugin. This
     * is distinct from the Volume's Swarm ID, which is the ID used by all of
     * the Docker Engine to refer to the Volume. If this field is blank, then
     * the Volume has not been successfully created yet.
     */
    VolumeID?: string
}
