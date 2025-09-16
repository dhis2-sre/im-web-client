/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { ExternalDownload } from './ExternalDownload'
import type { Lock } from './Lock'
import { User } from './User.ts'
export type Database = {
    createdAt: string
    externalDownloads?: Array<ExternalDownload>
    groupName: string
    id: number
    lock?: Lock
    name: string
    slug: string
    updatedAt: string
    url?: string
    user: User
}
