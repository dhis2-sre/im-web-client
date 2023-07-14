import {
    Button,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    IconAdd24,
    IconCheckmark16,
} from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import styles from './groups-list.module.css'
import type { FC } from 'react'
import { useState } from 'react'
import { Group } from '../../types'
import { NewGroupModal } from '.'

export const GroupsList: FC = () => {
    const [showNewGroupModal, setShowNewGroupModal] = useState(false)

    const [{ data }, refetch] = useAuthAxios<Group[]>('/groups', { useCache: false })

    const onClose = () => {
        setShowNewGroupModal(false)
        refetch()
    }

    return (
        <div>
            <div className={styles.heading}>
                <h1>Groups</h1>
                <Button icon={<IconAdd24 />} onClick={() => setShowNewGroupModal(true)}>
                    New group
                </Button>
            </div>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Hostname</DataTableColumnHeader>
                        <DataTableColumnHeader>Deployable</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {data?.map((group) => {
                        return (
                            <DataTableRow key={group.name}>
                                <DataTableCell>{group.name}</DataTableCell>
                                <DataTableCell>{group.hostname}</DataTableCell>
                                <DataTableCell>{group.deployable ? <IconCheckmark16 /> : <></>}</DataTableCell>
                                <DataTableCell>
                                    <Moment date={group.createdAt} fromNow />
                                </DataTableCell>
                                <DataTableCell>
                                    <Moment date={group.updatedAt} fromNow />
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </TableBody>
            </DataTable>
            {showNewGroupModal && <NewGroupModal onClose={onClose} />}
        </div>
    )
}
