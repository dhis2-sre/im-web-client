/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type SaveDeploymentRequest = {
    description?: string;
    group?: string;
    name?: string;
    /**
     * Overwrite replaces a preset of the same name instead of refusing it. It only applies to presets.
     */
    overwrite?: boolean;
    preset?: boolean;
    ttl?: number;
};

