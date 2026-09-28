import type { Database } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

/* An instance stores its database as an id, so anything showing that parameter back has to resolve
 * it to the name the form offered when it was picked. The id is the fallback while the request is in
 * flight and when the database has since been deleted, since it is still something a user can look
 * up. */
export const useDatabaseLabel = (databaseId?: string) => {
    const id = (databaseId ?? '').trim()
    const resolvable = id !== '' && id !== '0'
    const [{ data, loading }] = useAuthAxios<Database>(`/databases/${id}`, { manual: !resolvable, autoCatch: true })

    if (!data?.name) {
        return { label: id, loading: resolvable && loading }
    }

    return { label: data.groupName ? `${data.groupName}/${data.name}` : data.name, loading: false }
}
