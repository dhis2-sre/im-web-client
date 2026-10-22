import { useMemo, useState } from 'react'
import { useOnlyMine } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'

export const useDatabases = () => {
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', {
        useCache: false,
    })
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyDatabases')
    const [searchTerm, setSearchTerm] = useState('')

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

    return { groups, total: data?.reduce((sum, group) => sum + group.databases.length, 0) ?? 0, error, loading, refetch, onlyMine, setOnlyMine, searchTerm, setSearchTerm }
}
