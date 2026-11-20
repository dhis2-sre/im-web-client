import type { User } from '../../types/index.ts'

export type Role = 'member' | 'admin'

/* A group as the user stands in it. im-manager keeps membership and admin rights as two separate
 * lists, and admin rights alone give the group's access, so a user can be an admin without being a
 * member. The page shows one role per group: Admin wherever they hold admin rights. */
export type GroupRole = { name: string; member: boolean; admin: boolean }

export const groupRoles = (user: User): GroupRole[] => {
    const admin = new Set(user.adminGroups?.map((group) => group.name))
    const member = new Set(user.groups?.map((group) => group.name))
    const names = [...new Set([...member, ...admin])]
    return names.map((name) => ({ name, member: member.has(name), admin: admin.has(name) }))
}

export type RoleRequest = { method: 'post' | 'delete'; list: 'users' | 'admins' }

/* The calls that leave the user holding exactly this role in the group, or out of it for null. An
 * admin is made a member too, so taking their admin rights away later still leaves them in the
 * group. */
export const roleRequests = (current: Pick<GroupRole, 'member' | 'admin'>, role: Role | null): RoleRequest[] => {
    const wantMember = role !== null
    const wantAdmin = role === 'admin'
    return [
        wantMember && !current.member && { method: 'post', list: 'users' },
        wantAdmin && !current.admin && { method: 'post', list: 'admins' },
        !wantAdmin && current.admin && { method: 'delete', list: 'admins' },
        !wantMember && current.member && { method: 'delete', list: 'users' },
    ].filter((request): request is RoleRequest => Boolean(request))
}
