import { FC, useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { StacksContext } from '../contexts/index.ts'
import { useAuthAxios } from '../hooks/use-auth-axios.ts'
import type { Stack } from '../types/index.ts'

export const StacksProvider: FC = () => {
    const [{ data, loading, error }] = useAuthAxios<Stack[]>('/stacks')

    const value = useMemo(
        () => ({
            stacks: data ?? [],
            loading,
            error: error ?? null,
        }),
        [data, loading, error]
    )

    return (
        <StacksContext.Provider value={value}>
            <Outlet />
        </StacksContext.Provider>
    )
}
