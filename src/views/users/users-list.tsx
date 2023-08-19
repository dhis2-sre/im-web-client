import { ButtonStrip, DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import styles from './users-list.module.css'
import type { FC } from 'react'
import { User } from '../../types'
import { Link } from 'react-router-dom'

export const UsersList: FC = () => {
    const [{ data }] = useAuthAxios<User[]>('/users', {
        useCache: false,
    })

    return (
        <div>
            <div className={styles.heading}>
                <h1>Users</h1>
            </div>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Email</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                        <DataTableColumnHeader>Groups</DataTableColumnHeader>
                        <DataTableColumnHeader>Administrator Groups</DataTableColumnHeader>
                        <DataTableColumnHeader></DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {data?.map((user) => {
                        return (
                            <DataTableRow key={user.id}>
                                <DataTableCell>
                                    <Link to={`/users/${user.id}`}>{user.email}</Link>
                                </DataTableCell>
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
                                <DataTableCell>
                                    <ButtonStrip>button</ButtonStrip>
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </TableBody>
            </DataTable>
        </div>
    )
}
