import { useCallback, useMemo } from 'react'
import { useOnlyMine, useSavedSearchParams } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'

export const useDatabases = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', {
        useCache: false,
    })
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyDatabases')
    /* The search and the tree view's folder live in the URL, remembered for the tab. */
    const { params, setParam } = useSavedSearchParams('databaseFilters')
    const searchTerm = params.get('q') ?? ''
    const setSearchTerm = useCallback((value: string) => setParam('q', value), [setParam])

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

    return { params, groups, total: data?.reduce((sum, group) => sum + group.databases.length, 0) ?? 0, error, loading, refetch, onlyMine, setOnlyMine, searchTerm, setSearchTerm }
}
