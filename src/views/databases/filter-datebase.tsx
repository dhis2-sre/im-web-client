import { useState, useMemo, useContext, useCallback } from 'react'
import { AuthContext } from '../../contexts/auth-context.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'

const useFilterDatabases = () => {
    const LOCAL_STORAGE_KEY = 'showOnlyMyDatabases'
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', {
        useCache: false,
    })

    const [showOnlyMyDatabases, _setShowOnlyMyDatabases] = useState<boolean>(() => {
        try {
            return !!JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
        } catch {
            return false
        }
    })

    const setShowOnlyMyDatabases: typeof _setShowOnlyMyDatabases = useCallback((showOnlyMyDatabases) => {
        return _setShowOnlyMyDatabases((prev) => {
            const resolvedValue = typeof showOnlyMyDatabases === 'function' ? showOnlyMyDatabases(prev) : showOnlyMyDatabases
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resolvedValue))
            return resolvedValue
        })
    }, [])

    const { currentUser } = useContext(AuthContext)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredData = useMemo(() => {
        let groups = data

        if (showOnlyMyDatabases) {
            groups = groups
                ?.map((group) => ({
                    ...group,
                    databases: group.databases.filter((db) => db.user.id === currentUser.id),
                }))
                ?.filter((group) => group.databases.length > 0)
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            groups = groups
                ?.map((group) => ({
                    ...group,
                    databases: group.databases.filter(
                        (db) => db.name?.toLowerCase().includes(term) || db.description?.toLowerCase().includes(term) || db.slug?.toLowerCase().includes(term)
                    ),
                }))
                ?.filter((group) => group.databases.length > 0)
        }

        return groups
    }, [data, currentUser, showOnlyMyDatabases, searchTerm])

    return {
        data: filteredData,
        error,
        loading,
        refetch,
        showOnlyMyDatabases,
        setShowOnlyMyDatabases,
        searchTerm,
        setSearchTerm,
    }
}

export default useFilterDatabases
