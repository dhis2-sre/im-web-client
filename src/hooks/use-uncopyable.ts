import { useMemo } from 'react'
import type { StackParameterWithGroup } from '../types/index.ts'
import { uncopyableParameters } from '../views/presets/preset-payloads.ts'
import { useStacks } from './use-stacks.ts'

/* Stacks not loaded yet have no entry. */
export const useUncopyable = (stackNames: string[]): Record<string, string[]> => {
    const { stacks } = useStacks()
    const key = stackNames.join('\n')
    return useMemo(
        () =>
            Object.fromEntries(
                stacks
                    .filter((stack) => key.split('\n').includes(stack.name))
                    .map((stack) => [stack.name, uncopyableParameters((stack.parameters ?? []) as StackParameterWithGroup[])])
            ),
        [stacks, key]
    )
}
