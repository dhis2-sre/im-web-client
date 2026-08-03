import { StackParameterGroup, StackParameterWithGroup, StackWithParameterGroups } from '../types/index.ts'

export type StackParameterSection = {
    group?: StackParameterGroup
    parameters: StackParameterWithGroup[]
}

const byPriority = (a: StackParameterWithGroup, b: StackParameterWithGroup) => (a.priority ?? 0) - (b.priority ?? 0)

/* Splits a stack's parameters into the sections its groups declare, in declaration order, followed
 * by whatever belongs to no group. A stack that declares no groups comes back as a single section
 * without a group, which renders as the one flat list it has always been. */
export const groupStackParameters = (stack: StackWithParameterGroups | undefined): StackParameterSection[] => {
    const parameters = [...(stack?.parameters ?? [])]
    const groups = stack?.parameterGroups ?? []

    const sections = groups
        .map((group) => ({ group, parameters: parameters.filter((parameter) => parameter.group === group.name).sort(byPriority) }))
        .filter((section) => section.parameters.length > 0)

    const declaredGroupNames = new Set(groups.map((group) => group.name))
    const ungrouped = parameters.filter((parameter) => !parameter.group || !declaredGroupNames.has(parameter.group)).sort(byPriority)

    return ungrouped.length > 0 ? [...sections, { parameters: ungrouped }] : sections
}
