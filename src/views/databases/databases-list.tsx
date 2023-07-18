import {
    Button,
    ButtonStrip,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
    IconAdd24,
} from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import { GroupWithDatabases } from '../../types'
import { DeleteButton } from './delete-button'
import { DownloadButton } from './download-button'
import styles from './databases-list.module.css'
import type { FC } from 'react'
import { useState } from 'react'
import { UploadDatabaseModal } from './upload-database-modal'

export const DatabasesList: FC = () => {
    const [showUploadDatabaseModal, setShowUploadDatabaseModal] = useState(false)

    const onClose = () => {
        setShowUploadDatabaseModal(false)
    }

    const onUploadDatabaseComplete = () => {
        setShowUploadDatabaseModal(false)
        refetch()
    }

    const [{ data }, refetch] = useAuthAxios<GroupWithDatabases[]>('databases', {
        useCache: false,
    })

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>Databases</h1>
                <Button icon={<IconAdd24 />} onClick={() => setShowUploadDatabaseModal(true)}>
                    Upload database
                </Button>
            </div>

            {data?.map((group) => (
                <div key={group.name}>
                    <TableToolbar className={styles.tabletoolbar}>
                        <h2>{group.name}</h2>
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
                                            <DeleteButton id={database.id} databaseName={database.name} groupName={group.name} onComplete={refetch} />
                                        </ButtonStrip>
                                    </DataTableCell>
                                </DataTableRow>
                            ))}
                        </TableBody>
                    </DataTable>
                </div>
            ))}
            {showUploadDatabaseModal && <UploadDatabaseModal onComplete={onUploadDatabaseComplete} onClose={onClose} />}
        </div>
    )
}