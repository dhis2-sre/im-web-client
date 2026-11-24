import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import type { StackCompanion, StackEndpoint, StackParameterCondition } from '../../../types/index.ts'

/* An optional part of an instance, switched on by a 'true'/'false' parameter the stack marks as an add-on.
 * What it brings is whatever the stack gates on that parameter: a companion stack, sections of the main
 * stack, an address of its own, or nothing to show at all. */
export type AddOn = {
    parameter: string
    name: string
    description: string
    companion?: StackCompanion
    groups: GroupedParameters[]
    /* Where the add-on is served, after the instance's own path, for one with nothing to set. */
    pathSuffix?: string
}

const switchedOnBy = (parameter: string, when?: StackParameterCondition) => when?.parameter === parameter && when.equals === 'true'

/* The parameters the stack offers as add-ons, in the stack's order, each with what it switches on. */
export const findAddOns = (groups: GroupedParameters[], companions: StackCompanion[], endpoints: StackEndpoint[]): AddOn[] =>
    groups
        .flatMap(({ parameters }) => parameters)
        .filter(({ addOn }) => addOn)
        .map(({ parameterName = '', displayName, description }) => ({
            parameter: parameterName,
            name: displayName ?? parameterName,
            description: description ?? '',
            companion: companions.find(({ when }) => switchedOnBy(parameterName, when)),
            groups: groups.filter(({ group }) => switchedOnBy(parameterName, group.when)),
            pathSuffix: endpoints.find(({ when }) => switchedOnBy(parameterName, when))?.pathSuffix,
        }))
