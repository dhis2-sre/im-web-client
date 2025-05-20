/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExternalDownload } from './ExternalDownload'
import type { Lock } from './Lock'
export type Database = {
    createdAt?: string
    externalDownloads?: Array<ExternalDownload>
    filestore?: Database
    filestoreId?: number
    groupName?: string
    id?: number
    lock?: Lock
    name?: string
    slug?: string
    /**
     * TODO: Sql or fs?
     */
    type?: string
    updatedAt?: string
    url?: string
}
