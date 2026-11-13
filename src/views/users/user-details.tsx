import {
    Button,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    IconAdd16,
    IconBlock16,
    IconCheckmark16,
    IconClock16,
    Tag,
} from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ActionsMenu, MetaFact, MetaLine, MomentFromNow, Page, Panel, useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { User } from '../../types/index.ts'
import { AddToGroupModal } from './add-to-group-modal.tsx'
import { groupRoles } from './group-roles.ts'
import type { GroupRole, Role } from './group-roles.ts'
import { useSetGroupRole } from './use-set-group-role.ts'

/* Whether they confirmed their email and when they signed up. */
const userFacts = (user: User): Record<string, ReactNode> => ({
    validated: user.validated ? <MetaFact icon={<IconCheckmark16 />}>Email confirmed</MetaFact> : <MetaFact icon={<IconBlock16 />}>Email not confirmed</MetaFact>,
    created: user.createdAt && (
        <MetaFact icon={<IconClock16 />}>
            Joined <MomentFromNow date={user.createdAt} />
        </MetaFact>
    ),
})

/* Switches the user between member and admin of a group, or takes them out of it. */
const GroupRoleMenu: FC<{ user: User; group: GroupRole; refetch: () => void }> = ({ user, group, refetch }) => {
    const setGroupRole = useSetGroupRole()
    const alert = useActionAlert()
    const next: Role = group.admin ? 'member' : 'admin'

    const change = async (role: Role | null, done: string, failed: string) => {
        try {
            await setGroupRole(user.id, group, role)
            alert.success(done)
        } catch (error) {
            console.error(error)
            alert.error(failed)
        }
        refetch()
    }

    return (
        <ActionsMenu
            label={`Actions for ${group.name}`}
            items={[
                {
                    label: next === 'admin' ? 'Make admin' : 'Make member',
                    onClick: () =>
                        change(
                            next,
                            `${user.email} is now ${next === 'admin' ? 'an admin' : 'a member'} of ${group.name}`,
                            `Couldn't change ${user.email}'s role in ${group.name}`
                        ),
                },
                {
                    label: 'Remove from group',
                    destructive: true,
                    confirm: {
                        title: 'Remove from group',
                        message: (
                            <>
                                Remove <strong>{user.email}</strong> from <strong>{group.name}</strong>?
                            </>
                        ),
                        confirmLabel: 'Remove from group',
                        destructive: true,
                    },
                    onClick: () => change(null, `Removed ${user.email} from ${group.name}`, `Couldn't remove ${user.email} from ${group.name}`),
                },
            ]}
        />
    )
}

export const UserDetails = () => {
    const { id } = useParams()
    const [{ data: user, loading, error }, refetch] = useAuthAxios<User>(`/users/${id}`)
    const [adding, setAdding] = useState(false)
    const groups = user ? groupRoles(user) : []

    return (
        <Page
            key={id}
            parent={{ label: 'Users', to: '/users' }}
            title={user?.email}
            band
            loading={loading && !user}
            error={error && !user ? { title: "Couldn't load the user", description: error.message } : undefined}
            summary={user && <MetaLine items={userFacts(user)} />}
        >
            {user && (
                <Panel
                    title="Groups"
                    flush={groups.length > 0}
                    actions={
                        <Button secondary small icon={<IconAdd16 />} onClick={() => setAdding(true)}>
                            Add to group…
                        </Button>
                    }
                >
                    {groups.length > 0 ? (
                        <DataTable>
                            <DataTableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Group</DataTableColumnHeader>
                                    <DataTableColumnHeader>Role</DataTableColumnHeader>
                                    <DataTableColumnHeader width="1%">
                                        <span className="visually-hidden">Actions</span>
                                    </DataTableColumnHeader>
                                </DataTableRow>
                            </DataTableHead>
                            <DataTableBody>
                                {groups.map((group) => (
                                    <DataTableRow key={group.name}>
                                        <DataTableCell staticStyle>
                                            <Link to={`/groups/${group.name}`}>{group.name}</Link>
                                        </DataTableCell>
                                        <DataTableCell staticStyle>{group.admin ? <Tag neutral>Admin</Tag> : 'Member'}</DataTableCell>
                                        <DataTableCell staticStyle align="right">
                                            <GroupRoleMenu user={user} group={group} refetch={() => void refetch()} />
                                        </DataTableCell>
                                    </DataTableRow>
                                ))}
                            </DataTableBody>
                        </DataTable>
                    ) : (
                        'Not in any group yet.'
                    )}
                </Panel>
            )}
            {adding && user && <AddToGroupModal user={user} joined={groups.map((group) => group.name)} onClose={() => setAdding(false)} onChanged={() => void refetch()} />}
        </Page>
    )
}
