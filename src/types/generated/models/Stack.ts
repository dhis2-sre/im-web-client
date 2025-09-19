/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { StackParameter } from './StackParameter'
export type Stack = {
    name?: string
    parameters?: Array<StackParameter>
    requires?: Array<Stack>
}
