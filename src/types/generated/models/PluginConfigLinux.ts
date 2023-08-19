/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PluginDevice } from './PluginDevice'

/**
 * PluginConfigLinux plugin config linux
 */
export type PluginConfigLinux = {
    /**
     * allow all devices
     */
    AllowAllDevices: boolean
    /**
     * capabilities
     */
    Capabilities: Array<string>
    /**
     * devices
     */
    Devices: Array<PluginDevice>
}
