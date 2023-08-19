/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PluginConfigArgs } from './PluginConfigArgs'
import type { PluginConfigInterface } from './PluginConfigInterface'
import type { PluginConfigLinux } from './PluginConfigLinux'
import type { PluginConfigNetwork } from './PluginConfigNetwork'
import type { PluginConfigRootfs } from './PluginConfigRootfs'
import type { PluginConfigUser } from './PluginConfigUser'
import type { PluginEnv } from './PluginEnv'
import type { PluginMount } from './PluginMount'

export type PluginConfig = {
    Args: PluginConfigArgs
    /**
     * description
     */
    Description: string
    /**
     * Docker Version used to create the plugin
     */
    DockerVersion?: string
    /**
     * documentation
     */
    Documentation: string
    /**
     * entrypoint
     */
    Entrypoint: Array<string>
    /**
     * env
     */
    Env: Array<PluginEnv>
    Interface: PluginConfigInterface
    /**
     * ipc host
     */
    IpcHost: boolean
    Linux: PluginConfigLinux
    /**
     * mounts
     */
    Mounts: Array<PluginMount>
    Network: PluginConfigNetwork
    /**
     * pid host
     */
    PidHost: boolean
    /**
     * propagated mount
     */
    PropagatedMount: string
    User?: PluginConfigUser
    /**
     * work dir
     */
    WorkDir: string
    rootfs?: PluginConfigRootfs
}
