/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */

export type saveAsRequest = {
    /**
     * Database dump format. Currently plain and custom are support, please see https://www.postgresql.org/docs/current/app-pgdump.html
     */
    format?: string
    /**
     * Name of the new database
     */
    name?: string
}
