/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Secret represents a Swarm Secret value that must be passed to the CSI
 * storage plugin when operating on this Volume. It represents one key-value
 * pair of possibly many.
 */
export type Secret = {
    /**
     * Key is the name of the key of the key-value pair passed to the plugin.
     */
    Key?: string
    /**
     * Secret is the swarm Secret object from which to read data. This can be a
     * Secret name or ID. The Secret data is retrieved by Swarm and used as the
     * value of the key-value pair passed to the plugin.
     */
    Secret?: string
}
