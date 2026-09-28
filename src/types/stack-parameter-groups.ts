import { Stack, StackParameter } from './generated/index.ts'

export type StackParameterCondition = {
    parameter: string
    equals: string
}

export type StackParameterGroup = {
    name: string
    title: string
    when?: StackParameterCondition
}

/* immutableReason is the stack's own explanation of why a parameter cannot change once the instance
 * has been deployed. The edit form renders those fields read only with it, and the backend rejects a
 * change to one, so the two cannot disagree about what is editable. */
export type StackParameterWithGroup = StackParameter & { group?: string; immutableReason?: string }

/* A stack deployable alongside this one. Like requires it carries only a name, so its parameters
 * come from fetching that stack. A condition means it applies only while the condition holds over
 * the offering stack's parameters. */
export type StackCompanion = {
    name: string
    when?: StackParameterCondition
}

export type StackWithParameterGroups = Omit<Stack, 'parameters'> & {
    parameterGroups?: StackParameterGroup[]
    parameters?: StackParameterWithGroup[]
    companions?: StackCompanion[]
}
