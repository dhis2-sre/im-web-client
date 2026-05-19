import { Center, CircularLoader, NoticeBox, DataTable, TableHead, DataTableRow, DataTableColumnHeader, TableBody, DataTableCell } from '@dhis2/ui'
import { useParams } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { User } from '../../types/index.ts'
import { AddToGroupAdminButton } from './add-to-group-admin-button.tsx'
import { AddToGroupButton } from './add-to-group-button.tsx'
import { RemoveFromGroupAdminButton } from './remove-from-group-admin-button.tsx'
import { RemoveFromGroupButton } from './remove-from-group-button.tsx'

export const UserDetails = () => {
    const { id } = useParams()
    const [{ data: user, loading, error }, refetch] = useAuthAxios<User>(`/users/${id}`)

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Could not fetch user details">
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <div key={user.id}>
            <Heading title={user.email}>
                <AddToGroupButton onComplete={refetch} user={user} />
                <AddToGroupAdminButton onComplete={refetch} user={user} />
            </Heading>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Member</DataTableColumnHeader>
                        <DataTableColumnHeader>Admin</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {user.groups?.map((group) => (
                        <DataTableRow key={group.name}>
                            <DataTableCell>{group.name}</DataTableCell>
                            <DataTableCell>
                                <RemoveFromGroupButton group={group.name} userId={user.id} onComplete={refetch} />
                            </DataTableCell>
                            <DataTableCell>
                                {user.adminGroups?.some((g) => g.name === group.name) && <RemoveFromGroupAdminButton group={group.name} userId={user.id} onComplete={refetch} />}
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </TableBody>
            </DataTable>
        </div>
    )
}
