import { groupRoles, roleRequests } from './group-roles.ts'

describe('groupRoles', () => {
    it('lists a group the user only administers, which the groups list alone would leave out', () => {
        const roles = groupRoles({ groups: [{ name: 'design' }], adminGroups: [{ name: 'design' }, { name: 'training' }] })
        expect(roles).toEqual([
            { name: 'design', member: true, admin: true },
            { name: 'training', member: false, admin: true },
        ])
    })
})

describe('roleRequests', () => {
    const none = { member: false, admin: false }
    const member = { member: true, admin: false }
    const admin = { member: true, admin: true }
    const adminOnly = { member: false, admin: true }

    it('adds a new admin as a member as well', () => {
        expect(roleRequests(none, 'admin')).toEqual([
            { method: 'post', list: 'users' },
            { method: 'post', list: 'admins' },
        ])
    })

    it('makes a member an admin without touching their membership', () => {
        expect(roleRequests(member, 'admin')).toEqual([{ method: 'post', list: 'admins' }])
    })

    it('makes an admin a member by taking their admin rights away', () => {
        expect(roleRequests(admin, 'member')).toEqual([{ method: 'delete', list: 'admins' }])
    })

    it('keeps an admin who was never a member in the group when making them a member', () => {
        expect(roleRequests(adminOnly, 'member')).toEqual([
            { method: 'post', list: 'users' },
            { method: 'delete', list: 'admins' },
        ])
    })

    it('removes both lists when removing the user from the group', () => {
        expect(roleRequests(admin, null)).toEqual([
            { method: 'delete', list: 'admins' },
            { method: 'delete', list: 'users' },
        ])
        expect(roleRequests(adminOnly, null)).toEqual([{ method: 'delete', list: 'admins' }])
    })

    it('asks for nothing when the role already holds', () => {
        expect(roleRequests(member, 'member')).toEqual([])
    })
})
