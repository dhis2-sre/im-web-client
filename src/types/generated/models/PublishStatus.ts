/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublishState } from './PublishState'

/**
 * PublishStatus represents the status of the volume as published to an
 * individual node
 */
export type PublishStatus = {
    /**
     * NodeID is the ID of the swarm node this Volume is published to.
     */
    NodeID?: string
    /**
     * PublishContext is the PublishContext returned by the CSI plugin when
     * a volume is published.
     */
    PublishContext?: Record<string, string>
    State?: PublishState
}
