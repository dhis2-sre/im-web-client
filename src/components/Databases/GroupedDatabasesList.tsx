import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, DataTableToolbar as TableToolbar } from '@dhis2/ui'
import Moment from 'react-moment'
import { GroupWithDatabases } from '../../types'
import { useAuthAxios } from '../../hooks'
import { UploadButton } from './UploadButton'
import { DeleteButton } from './DeleteButton'
import { DownloadButton } from './DownloadButton'
import styles from './List.module.css'

export const GroupedDatabasesList = () => {
    const [{ data: groupWithDatabases }, fetchGroupWithDatabases] = useAuthAxios<GroupWithDatabases>('databases')

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All databases</h1>
            </div>

            {groupWithDatabases?.map((group) => (
                <div key={group.name}>
                    <TableToolbar className={styles.tabletoolbar}>
                        <h2>{group.name}</h2>
                        <UploadButton groupName={group.name} />
                    </TableToolbar>
                    <DataTable>
                        <TableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>
                        </TableHead>
                        <TableBody>
                            {group.databases?.map((database) => (
                                <DataTableRow key={database.id}>
                                    <DataTableCell>{database.name}</DataTableCell>
                                    <DataTableCell>
                                        <Moment date={database.createdAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <Moment date={database.updatedAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <DownloadButton id={database.id} />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <DeleteButton id={database.id} databaseName={database.name} groupName={group.name} onDeleteComplete={fetchGroupWithDatabases} />
                                    </DataTableCell>
                                </DataTableRow>
                            ))}
                        </TableBody>
                    </DataTable>
                </div>
            ))}
        </div>
    )
}
