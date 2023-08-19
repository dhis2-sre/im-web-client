import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, IconCheckmark16 } from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import styles from './groups-list.module.css'
import type { FC } from 'react'
import { Group } from '../../types'
import { NewGroupButton } from './new-group-button'

export const GroupsList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<Group[]>('/groups', { useCache: false })

    return (
        <div>
            <div className={styles.heading}>
                <h1>Groups</h1>
                <NewGroupButton onComplete={refetch} />
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
        </div>
    )
}
