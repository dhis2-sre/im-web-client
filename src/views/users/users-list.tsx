import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { MomentFromNow, Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { User } from '../../types/index.ts'

export const UsersList: FC = () => {
    const [{ data, loading, error }] = useAuthAxios<User[]>('/users', {
        useCache: false,
    })

    return (
        <Page title="Users" loading={loading} error={error ? { title: "Couldn't load users", description: error.message } : undefined}>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Email</DataTableColumnHeader>
                        <DataTableColumnHeader>Email confirmed</DataTableColumnHeader>
                        <DataTableColumnHeader>Joined</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                        <DataTableColumnHeader>Member of</DataTableColumnHeader>
                        <DataTableColumnHeader>Admin of</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {data?.map((user) => (
                        <DataTableRow key={user.id}>
                            <DataTableCell>
                                <Link to={`/users/${user.id}`}>{user.email}</Link>
                            </DataTableCell>
                            <DataTableCell>{user.validated ? 'Yes' : 'No'}</DataTableCell>
                            <DataTableCell>
                                <MomentFromNow date={user.createdAt} />
                            </DataTableCell>
                            <DataTableCell>
                                <MomentFromNow date={user.updatedAt} />
                            </DataTableCell>
                            <DataTableCell>
                                <ul>
                                    {user.groups?.map((group) => {
                                        return <li key={group.name}>{group.name}</li>
                                    })}
                                </ul>
                            </DataTableCell>
                            <DataTableCell>
                                <ul>
                                    {user.adminGroups?.map((group) => {
                                        return <li key={group.name}>{group.name}</li>
                                    })}
                                </ul>
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </TableBody>
            </DataTable>
        </Page>
    )
}
