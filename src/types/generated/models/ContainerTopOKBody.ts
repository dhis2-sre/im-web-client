/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * ContainerTopOKBody OK response to ContainerTop operation
 */
export type ContainerTopOKBody = {
    /**
     * Each process running in the container, where each is process
     * is an array of values corresponding to the titles.
     */
    Processes: Array<Array<string>>
    /**
     * The ps column titles
     */
    Titles: Array<string>
}
