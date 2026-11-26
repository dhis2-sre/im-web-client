import type { AnyObject } from 'final-form'
import { useCallback, useMemo } from 'react'
import { StackParameterGroup, StackParameterWithGroup } from '../types/index.ts'
import { useStack, useStacks } from './use-stacks.ts'

export type GroupedParameters = {
    group: StackParameterGroup
    parameters: StackParameterWithGroup[]
}

/* Stacks without declared groups render as a single flat section. */
const FLAT_GROUP: StackParameterGroup = { name: '', title: 'Parameters' }

/* The values a stack's parameters start with, where it declares one. Consumed parameters are the server's to fill. */
export const parameterDefaults = (parameters: StackParameterWithGroup[] = []) =>
    parameters.reduce<Record<string, string>>((defaults, parameter) => {
        if (parameter.parameterName && parameter.defaultValue !== undefined && !parameter.consumed) {
            defaults[parameter.parameterName] = parameter.defaultValue
        }
        return defaults
    }, {})

export const useGroupedStackParameters = (stackName: string) => {
    const { stack, loading, error } = useStack(stackName)
    const { stacks } = useStacks()

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

    const initialParameterValues = useMemo(() => parameterDefaults(parameters), [parameters])

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

    /* Why each parameter cannot change once the instance has been deployed, for the ones that
     * cannot. The stack is the only place that knows, so the form renders the reason rather than
     * inventing its own wording. */
    const immutableReasons = useMemo(
        () =>
            parameters.reduce<Record<string, string>>((reasons, parameter) => {
                if (parameter.parameterName && parameter.immutableReason) {
                    reasons[parameter.parameterName] = parameter.immutableReason
                }
                return reasons
            }, {}),
        [parameters]
    )

    const companions = useMemo(() => stack?.companions ?? [], [stack])
    const endpoints = useMemo(() => stack?.endpoints ?? [], [stack])

    /* Every stack's defaults, the companions' as well, keyed as the form keeps them. A form filled from a preset
     * lays the preset over these, so a companion it turns on starts complete rather than being seeded, and so
     * changed, once its section appears. */
    const stackDefaults = useMemo(
        () => ({
            ...Object.fromEntries(companions.map(({ name }) => [name, parameterDefaults(stacks.find((candidate) => candidate.name === name)?.parameters)])),
            [stackName]: initialParameterValues,
        }),
        [companions, stacks, stackName, initialParameterValues]
    )

    /* The parameters whose section shows for these values: a conditional group counts only while its condition holds,
     * so a value typed into a section a later choice hid is never sent. */
    const getIncludedParameters = useCallback(
        (values: AnyObject) => {
            const stackValues: AnyObject = values[stackName] ?? {}
            return groups
                .filter(({ group }) => !group.when || stackValues[group.when.parameter] === group.when.equals)
                .flatMap((grouped) => grouped.parameters.map((parameter) => parameter.parameterName ?? ''))
        },
        [groups, stackName]
    )

    return { loading, error, groups, companions, endpoints, initialParameterValues, stackDefaults, sensitiveParameters, immutableReasons, getIncludedParameters }
}
