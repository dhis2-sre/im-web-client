/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Deployment } from './Deployment'
import type { DeploymentInstanceParameters } from './DeploymentInstanceParameters'

export type DeploymentInstance = {
    createdAt?: string
    deployLog?: string
    deployment?: Deployment
    deploymentId?: number
    id?: number
    parameters?: DeploymentInstanceParameters
    stackName?: string
    updatedAt?: string
}
