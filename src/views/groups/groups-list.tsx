import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, IconCheckmark16 } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/index.ts'
import { NewGroupButton } from './new-group-button.tsx'

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
                        <DataTableColumnHeader>Namespace</DataTableColumnHeader>
                        <DataTableColumnHeader>Hostname</DataTableColumnHeader>
                        <DataTableColumnHeader>Description</DataTableColumnHeader>
                        <DataTableColumnHeader>Cluster</DataTableColumnHeader>
                        <DataTableColumnHeader>Deployable</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {data?.map((group) => (
                        <DataTableRow key={group.name}>
                            <DataTableCell>{group.name}</DataTableCell>
                            <DataTableCell>{group.namespace}</DataTableCell>
                            <DataTableCell>{group.hostname}</DataTableCell>
                            <DataTableCell>{group.description}</DataTableCell>
                            <DataTableCell>{group.cluster.name}</DataTableCell>
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
