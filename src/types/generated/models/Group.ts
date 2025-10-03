/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cluster } from './Cluster';
import type { User } from './User';
/**
 * Group domain object defining a group
 */
export type Group = {
    adminUsers?: Array<User>;
    cluster?: Cluster;
    clusterId?: number;
    createdAt?: string;
    deployable?: boolean;
    description?: string;
    hostname?: string;
    name?: string;
    namespace?: string;
    updatedAt?: string;
    users?: Array<User>;
};

