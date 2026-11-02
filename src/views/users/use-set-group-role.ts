import { useCallback } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'
import { roleRequests } from './group-roles.ts'
import type { GroupRole, Role } from './group-roles.ts'

/* Gives a user a role in a group, or takes them out of it for null, one call at a time. */
export const useSetGroupRole = () => {
    const [, execute] = useAuthAxios({}, { manual: true })

    return useCallback(
        async (userId: number, group: GroupRole, role: Role | null) => {
            for (const { method, list } of roleRequests(group, role)) {
                await execute({ url: `/groups/${group.name}/${list}/${userId}`, method })
            }
        },
        [execute]
    )
}
