import { createContext } from 'react'
import type { Stack } from '../types/index.ts'

export type StacksContextApi = {
    stacks: Stack[]
    loading: boolean
    error: Error | null
}

export const StacksContext = createContext<StacksContextApi | null>(null)
