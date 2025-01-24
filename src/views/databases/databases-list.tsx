import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, DataTableToolbar as TableToolbar } from '@dhis2/ui'
import { useRef, useState, FC } from 'react'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database, GroupsWithDatabases } from '../../types/index.ts'
import { DatabaseRow } from './database-row.tsx'
import styles from './databases-list.module.css'
import { UploadButton } from './upload-button.tsx'

export const DatabasesList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', { useCache: false })
    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null)
    const rowRefs = useRef<(HTMLTableCellElement | null)[]>([])

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
                            {group.databases?.map((database: Database, index) => {
                                const rowRef = (el: HTMLTableCellElement | null) => {
                                    rowRefs.current[index] = el
                                }

                                return (
                                    <DatabaseRow
                                        key={database.id}
                                        database={database}
                                        groupName={group.name}
                                        refetch={refetch}
                                        openPopoverId={openPopoverId}
                                        setOpenPopoverId={setOpenPopoverId}
                                        rowRef={rowRef}
                                        rowRefs={rowRefs}
                                        index={index}
                                    />
                                )
                            })}
                        </TableBody>
                    </DataTable>
                </div>
            ))}
        </div>
    )
}
