import {
    ButtonStrip,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    DataTableBody as TableBody,
    DataTableHead as TableHead,
    DataTableToolbar as TableToolbar,
} from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import { GroupWithDatabases } from '../../types'
import { DeleteButton } from './delete-button'
import { DownloadButton } from './download-button'
import styles from './grouped-databases-list.module.css'
import { UploadButton } from './upload-button'

export const DatabasesList = () => {
    const [{ data: groupsWithDatabases }, fetchGroupsWithDatabases] = useAuthAxios<GroupWithDatabases[]>('databases', {
        useCache: false,
    })

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All databases</h1>
            </div>

            {groupsWithDatabases?.map((group) => (
                <div key={group.name}>
                    <TableToolbar className={styles.tabletoolbar}>
                        <h2>{group.name}</h2>
                        <UploadButton groupName={group.name} onComplete={fetchGroupsWithDatabases} />
                    </TableToolbar>
                    <DataTable>
                        <TableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
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
                                        <ButtonStrip>
                                            <DownloadButton id={database.id} />
                                            <DeleteButton
                                                id={database.id}
                                                databaseName={database.name}
                                                groupName={group.name}
                                                onComplete={fetchGroupsWithDatabases}
                                            />
                                        </ButtonStrip>
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
