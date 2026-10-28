import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import { Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { User } from '../../types/index.ts'

export const UsersList: FC = () => {
    const [{ data, loading, error }] = useAuthAxios<User[]>('/users', {
        useCache: false,
    })

    return (
        <Page title="Users" loading={loading} error={error ? { title: 'Could not fetch users', description: error.message } : undefined}>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Email</DataTableColumnHeader>
                        <DataTableColumnHeader>Validated</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                        <DataTableColumnHeader>Groups</DataTableColumnHeader>
                        <DataTableColumnHeader>Groups Admin</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {data?.map((user) => (
                        <DataTableRow key={user.id}>
                            <DataTableCell>
                                <Link to={`/users/${user.id}`}>{user.email}</Link>
                            </DataTableCell>
                            <DataTableCell>{user.validated ? 'true' : 'false'}</DataTableCell>
                            <DataTableCell>
                                <Moment date={user.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell>
                                <Moment date={user.updatedAt} fromNow />
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
