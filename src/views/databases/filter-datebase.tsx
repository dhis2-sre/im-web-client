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

    const filteredData = useMemo(() => {
        let filteredGroups = data?.map((group) => ({
            ...group,
            databases: group.databases.filter((db) => db.user.id === currentUser.id),
        }))
        if (filteredGroups) {
            filteredGroups = filteredGroups.filter((group) => group.databases.length > 0)
        }
        return showOnlyMyDatabases ? filteredGroups : data
    }, [data, currentUser, showOnlyMyDatabases])

    return {
        data: filteredData,
        error,
        loading,
        refetch,
        showOnlyMyDatabases,
        setShowOnlyMyDatabases,
    }
}

export default useFilterDatabases
