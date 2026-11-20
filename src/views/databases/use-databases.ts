import { useCallback, useMemo } from 'react'
import { useOnlyMine, useSavedSearchParams } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'

export const useDatabases = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', {
        useCache: false,
    })
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyDatabases')
    /* The search and the group, which is also the tree view's folder, live in the URL, remembered for the tab. */
    const { params, setParams, setParam } = useSavedSearchParams('databaseFilters')
    const searchTerm = params.get('q') ?? ''
    const setSearchTerm = useCallback((value: string) => setParam('q', value), [setParam])
    const group = params.get('group')
    /* A new group starts at its top, so the path within the old one goes. */
    const setGroup = useCallback(
        (value: string | null) =>
            setParams(
                (current) => {
                    const next = new URLSearchParams(current)
                    next.delete('path')
                    if (value) {
                        next.set('group', value)
                    } else {
                        next.delete('group')
                    }
                    return next
                },
                { replace: true }
            ),
        [setParams]
    )
    const clearFilters = useCallback(() => {
        setParams(new URLSearchParams(), { replace: true })
        setOnlyMine(false)
    }, [setParams, setOnlyMine])

    const groups = useMemo(() => {
        const term = searchTerm.toLowerCase()
        const matches = (text?: string) => text?.toLowerCase().includes(term)

        return data
            ?.map((group) => ({
                ...group,
                databases: group.databases.filter((db) => isShown(db.user) && (!term || matches(db.name) || matches(db.description) || matches(db.slug))),
            }))
            .filter((group) => group.databases.length > 0)
    }, [data, isShown, searchTerm])

    return {
        params,
        groups,
        groupNames: data?.map((candidate) => candidate.name) ?? [],
        group,
        setGroup,
        clearFilters,
        total: data?.reduce((sum, group) => sum + group.databases.length, 0) ?? 0,
        error,
        loading,
        refetch,
        onlyMine,
        setOnlyMine,
        searchTerm,
        setSearchTerm,
    }
}
