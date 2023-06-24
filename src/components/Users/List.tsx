import {
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow
} from '@dhis2/ui'
import {useApi} from '../../api/useApi'
import styles from './List.module.css'
import {User} from "../../types"
import {getUsers} from "../../api"
import Moment from "react-moment"
import {Link} from "react-router-dom";

const ListUsers = () => {
    const {data: users, refetch} = useApi<User>(getUsers)

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
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {users?.map(user => {
                        return (
                            <DataTableRow key={user.id}>
                                <DataTableCell>
                                    <Link to={`/users/${user.id}`}>{user.email}</Link>
                                </DataTableCell>
                                <DataTableCell>
                                    <Moment date={user.createdAt} fromNow/>
                                </DataTableCell>
                                <DataTableCell>
                                    <Moment date={user.updatedAt} fromNow/>
                                </DataTableCell>
                                <DataTableCell>
                                    <ul>
                                        {user.groups?.map(group => {
                                            return (
                                                <li>{group.name}</li>
                                            )
                                        })}
                                    </ul>
                                </DataTableCell>
                                <DataTableCell>
                                    <ul>
                                        {user.adminGroups?.map(group => {
                                            return (
                                                <li>{group.name}</li>
                                            )
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

export default ListUsers
