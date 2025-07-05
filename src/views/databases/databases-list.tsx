import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, DataTableToolbar as TableToolbar } from '@dhis2/ui'
import { FC } from 'react'
import Moment from 'react-moment'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database, GroupsWithDatabases } from '../../types/index.ts'
import { DatabaseRowAction } from './database-row-action.tsx'
import styles from './databases-list.module.css'
import { Locked } from './locked.tsx'
import { UploadButton } from './upload-button.tsx'

export const DatabasesList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', { useCache: false })

    return (
        <div className={styles.wrapper}>
            <Heading title="Databases">
                <UploadButton onComplete={refetch} />
            </Heading>

            {data?.map((group) => (
                <div key={group.name}>
                    <TableToolbar className={styles.tabletoolbar}>
                        <h2>{group.name}</h2>
                    </TableToolbar>
                    <DataTable>
                        <TableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Slug</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader>Locked?</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>
                        </TableHead>
                        <TableBody>
                            {(!group.databases || group.databases.length === 0) && (
                                <DataTableRow>
                                    <DataTableCell colSpan="5">
                                        <h3>No databases</h3>
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                            {group.databases?.map((database: Database) => {
                                return (
                                    <DataTableRow key={database.id}>
                                        <DataTableCell>{database.name}</DataTableCell>
                                        <DataTableCell>{database.slug}</DataTableCell>
                                        <DataTableCell>
                                            <Moment date={database.createdAt} fromNow />
                                        </DataTableCell>
                                        <DataTableCell>
                                            <Moment date={database.updatedAt} fromNow />
                                        </DataTableCell>
                                        <DataTableCell>
                                            <Locked lock={database.lock} />
                                        </DataTableCell>
                                        <DataTableCell className={styles.rowPopoverTrigger}>
                                            <DatabaseRowAction database={database} groupName={database.groupName} refetch={refetch} />
                                        </DataTableCell>
                                    </DataTableRow>
                                )
                            })}
                        </TableBody>
                    </DataTable>
                </div>
            ))}
        </div>
    )
}
