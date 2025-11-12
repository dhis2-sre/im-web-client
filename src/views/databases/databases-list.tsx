import {
    Checkbox,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
} from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import { FC } from 'react'
import Moment from 'react-moment'
import { Heading } from '../../components/index.ts'
import { Database } from '../../types/index.ts'
import { DatabaseRowAction } from './database-row-action.tsx'
import styles from './databases-list.module.css'
import useFilterDatabases from './filter-datebase.tsx'
import { Locked } from './locked.tsx'
import { UploadButton } from './upload-button.tsx'

export const DatabasesList: FC = () => {
    const { data, refetch, showOnlyMyDatabases, setShowOnlyMyDatabases } = useFilterDatabases()

    return (
        <div className={styles.wrapper}>
            <Heading title="Databases">
                <UploadButton onComplete={refetch} />
                <Checkbox checked={showOnlyMyDatabases} label="Show only my databases" onChange={() => setShowOnlyMyDatabases(!showOnlyMyDatabases)} />
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
                                <DataTableColumnHeader>Description</DataTableColumnHeader>
                                <DataTableColumnHeader>Slug</DataTableColumnHeader>
                                <DataTableColumnHeader>Size</DataTableColumnHeader>
                                <DataTableColumnHeader>URL</DataTableColumnHeader>
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
                                const databaseSize = database.size ? prettyBytes(database.size) : '-'
                                return (
                                    <DataTableRow key={database.id}>
                                        <DataTableCell title={database.id.toString()}>{database.name}</DataTableCell>
                                        <DataTableCell>{database.description}</DataTableCell>
                                        <DataTableCell>{database.slug}</DataTableCell>
                                        <DataTableCell>{databaseSize}</DataTableCell>
                                        <DataTableCell>{database.url}</DataTableCell>
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
