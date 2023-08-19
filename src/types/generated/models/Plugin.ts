/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PluginConfig } from './PluginConfig'
import type { PluginSettings } from './PluginSettings'

/**
 * Plugin A plugin for the Engine API
 */
export type Plugin = {
    Config: PluginConfig
    /**
     * True if the plugin is running. False if the plugin is not running, only installed.
     */
    Enabled: boolean
    /**
     * Id
     */
    Id?: string
    /**
     * name
     */
    Name: string
    /**
     * plugin remote reference used to push/pull the plugin
     */
    PluginReference?: string
    Settings: PluginSettings
}
