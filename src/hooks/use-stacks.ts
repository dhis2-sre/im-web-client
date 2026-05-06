import { useContext, useMemo } from 'react'
import { StacksContext } from '../contexts/index.ts'

export const useStacks = () => {
    const ctx = useContext(StacksContext)
    if (!ctx) {
        throw new Error('`useStacks` must be used within a `StacksProvider`.')
    }
    return ctx
}

export const useStack = (name: string) => {
    const { stacks, loading, error } = useStacks()
    const stack = useMemo(() => stacks.find((s) => s.name === name), [stacks, name])
    return { stack, loading, error }
}
