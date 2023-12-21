import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, IconCheckmark16 } from '@dhis2/ui'
import Moment from 'react-moment'
import { useAuthAxios } from '../../hooks'
import type { FC } from 'react'
import { Group } from '../../types'
import { NewGroupButton } from './new-group-button'
import { Heading } from '../../components'

export const GroupsList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<Group[]>('/groups', { useCache: false })

    return (
        <div>
            <Heading title="Groups">
                <NewGroupButton onComplete={refetch} />
            </Heading>
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
                    {data?.map((group) => (
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
                    ))}
                </TableBody>
            </DataTable>
        </div>
    )
}
