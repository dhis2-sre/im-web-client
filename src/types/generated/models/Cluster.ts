/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Group } from './Group';
/**
 * Cluster domain object defining a cluster
 */
export type Cluster = {
    autoscaled: boolean;
    createdAt: string;
    description: string;
    groups?: Array<Group>;
    id: number;
    name: string;
    updatedAt: string;
};

