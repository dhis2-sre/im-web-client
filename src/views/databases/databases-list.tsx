import {
    ButtonStrip,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
} from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import { GroupsWithDatabases } from '../../types'
import { DeleteButton } from './delete-button'
import { DownloadButton } from './download-button'
import styles from './databases-list.module.css'
import type { FC } from 'react'
import { UploadButton } from './upload-button'
import { Heading } from '../../components'

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
                                <DataTableColumnHeader>slug</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>
                        </TableHead>
                        <TableBody>
                            {(!group.databases || group.databases.length === 0) && (
                                <DataTableRow>
                                    <DataTableCell colSpan="4">
                                        <h3>No databases</h3>
                                    </DataTableCell>
                                </DataTableRow>
                            )}
                            {group.databases?.map((database) => (
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
                                        <ButtonStrip>
                                            <DownloadButton id={database.id} />
                                            <DeleteButton id={database.id} databaseName={database.name} groupName={group.name} onComplete={refetch} />
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
