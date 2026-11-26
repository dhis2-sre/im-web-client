import { createContext } from 'react'
import type { StackWithParameterGroups } from '../types/index.ts'

export type StacksContextApi = {
    /* Typed by hand: the generated Stack lags the API on parameter groups, companions and the per-parameter flags. */
    stacks: StackWithParameterGroups[]
    loading: boolean
    error: Error | null
}

export const StacksContext = createContext<StacksContextApi | null>(null)
