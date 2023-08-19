/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessMode } from './AccessMode'
import type { Availability } from './Availability'
import type { CapacityRange } from './CapacityRange'
import type { Secret } from './Secret'
import type { TopologyRequirement } from './TopologyRequirement'

export type ClusterVolumeSpec = {
    AccessMode?: AccessMode
    AccessibilityRequirements?: TopologyRequirement
    Availability?: Availability
    CapacityRange?: CapacityRange
    /**
     * Group defines the volume group of this volume. Volumes belonging to the
     * same group can be referred to by group name when creating Services.
     * Referring to a volume by group instructs swarm to treat volumes in that
     * group interchangeably for the purpose of scheduling. Volumes with an
     * empty string for a group technically all belong to the same, emptystring
     * group.
     */
    Group?: string
    /**
     * Secrets defines Swarm Secrets that are passed to the CSI storage plugin
     * when operating on this volume.
     */
    Secrets?: Array<Secret>
}
