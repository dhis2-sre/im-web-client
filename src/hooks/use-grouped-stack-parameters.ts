import { useMemo } from 'react'
import { StackParameterGroup, StackParameterWithGroup, StackWithParameterGroups } from '../types/index.ts'
import { useStack } from './use-stacks.ts'

export type GroupedParameters = {
    group: StackParameterGroup
    parameters: StackParameterWithGroup[]
}

/* Stacks without declared groups render as a single flat section. */
const FLAT_GROUP: StackParameterGroup = { name: '', title: 'Parameters' }

export const useGroupedStackParameters = (stackName: string) => {
    const { stack: rawStack, loading, error } = useStack(stackName)
    const stack = rawStack as StackWithParameterGroups | undefined

    const parameters = useMemo(() => (stack?.parameters ?? []).filter((parameter) => !parameter.consumed).sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)), [stack])

    const groups = useMemo<GroupedParameters[]>(() => {
        const declaredGroups = stack?.parameterGroups
        if (!declaredGroups?.length) {
            return parameters.length > 0 ? [{ group: FLAT_GROUP, parameters }] : []
        }
        return declaredGroups
            .map((group) => ({ group, parameters: parameters.filter((parameter) => parameter.group === group.name) }))
            .filter((grouped) => grouped.parameters.length > 0)
    }, [stack, parameters])

    const initialParameterValues = useMemo(
        () =>
            parameters.reduce<Record<string, string>>((initialValues, parameter) => {
                if (parameter.parameterName && parameter.defaultValue !== undefined) {
                    initialValues[parameter.parameterName] = parameter.defaultValue
                }
                return initialValues
            }, {}),
        [parameters]
    )

    const sensitiveParameters = useMemo(
        () =>
            parameters.reduce<Record<string, boolean>>((sensitive, parameter) => {
                if (parameter.parameterName) {
                    sensitive[parameter.parameterName] = parameter.sensitive ?? false
                }
                return sensitive
            }, {}),
        [parameters]
    )

    return { loading, error, groups, initialParameterValues, sensitiveParameters }
}
