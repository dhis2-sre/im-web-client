/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PluginDevice } from './PluginDevice'
import type { PluginMount } from './PluginMount'

export type PluginSettings = {
    /**
     * args
     */
    Args: Array<string>
    /**
     * devices
     */
    Devices: Array<PluginDevice>
    /**
     * env
     */
    Env: Array<string>
    /**
     * mounts
     */
    Mounts: Array<PluginMount>
}
