/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { ExternalDownload } from './ExternalDownload';
import type { Lock } from './Lock';
import type { User } from './User';
export type Database = {
    createdAt?: string;
    description?: string;
    externalDownloads?: Array<ExternalDownload>;
    filestore?: Database;
    filestoreId?: number;
    groupName?: string;
    id?: number;
    lock?: Lock;
    name?: string;
    size?: number;
    slug?: string;
    type?: string;
    updatedAt?: string;
    url?: string;
    user?: User;
    userId?: number;
};

