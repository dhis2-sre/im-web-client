import { useAuthAxios } from '../../../hooks/index.ts'

export interface Instance {
    name: string
    description: string
    hostname: string
}

export interface Category {
    label: string
    instances: Instance[]
}

export interface GroupWithCategories {
    name: string
    description: string
    categories: Category[]
}

// Hook for fetching instance table data
export const useInstanceTableData = () => {
    const [{ data: groupsWithCategories, error, loading }] = useAuthAxios('/instances/public', { useCache: true })

    return {
        groupsWithCategories,
        error,
        loading,
    }
}
