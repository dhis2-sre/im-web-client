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

export type StackParameterWithGroup = StackParameter & { group?: string }

export type StackWithParameterGroups = Omit<Stack, 'parameters'> & {
    parameterGroups?: StackParameterGroup[]
    parameters?: StackParameterWithGroup[]
}
