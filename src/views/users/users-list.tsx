import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import type { FC } from 'react'
import { User } from '../../types'
import { Link } from 'react-router-dom'
import { Heading } from '../../components'

export const UsersList: FC = () => {
    const [{ data }] = useAuthAxios<User[]>('/users', {
        useCache: false,
    })

    return (
        <div>
            <Heading title="Users" />
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Email</DataTableColumnHeader>
                        <DataTableColumnHeader>Validated</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                        <DataTableColumnHeader>Groups</DataTableColumnHeader>
                        <DataTableColumnHeader>Administrator Groups</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {data?.map((user) => {
                        return (
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
                        )
                    })}
                </TableBody>
            </DataTable>
        </div>
    )
}
