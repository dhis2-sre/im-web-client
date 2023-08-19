/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClusterVolumeSpec } from './ClusterVolumeSpec'
import type { Info } from './Info'
import type { PublishStatus } from './PublishStatus'
import type { Version } from './Version'

/**
 * ClusterVolume contains options and information specific to, and only present
 * on, Swarm CSI cluster volumes.
 */
export type ClusterVolume = {
    CreatedAt?: string
    /**
     * ID is the Swarm ID of the volume. Because cluster volumes are Swarm
     * objects, they have an ID, unlike non-cluster volumes, which only have a
     * Name. This ID can be used to refer to the cluster volume.
     */
    ID?: string
    Info?: Info
    /**
     * PublishStatus contains the status of the volume as it pertains to its
     * publishing on Nodes.
     */
    PublishStatus?: Array<PublishStatus>
    Spec?: ClusterVolumeSpec
    UpdatedAt?: string
    Version?: Version
}
