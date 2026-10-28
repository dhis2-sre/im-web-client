import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, IconCheckmark16 } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import { Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/index.ts'
import { NewGroupButton } from './new-group-button.tsx'

export const GroupsList: FC = () => {
    const [{ data, loading, error }, refetch] = useAuthAxios<Group[]>('/groups', { useCache: false })

    return (
        <Page
            title="Groups"
            actions={<NewGroupButton onComplete={refetch} />}
            loading={loading && !data}
            error={error && !data ? { title: 'Could not fetch groups', description: error.message } : undefined}
        >
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
                            <DataTableCell>
                                <Link to={`/groups/${group.name}`}>{group.name}</Link>
                            </DataTableCell>
                            <DataTableCell>{group.namespace}</DataTableCell>
                            <DataTableCell>{group.hostname}</DataTableCell>
                            <DataTableCell>{group.description}</DataTableCell>
                            <DataTableCell>{group.cluster.name}</DataTableCell>
                            <DataTableCell>{group.deployable ? <IconCheckmark16 /> : null}</DataTableCell>
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
        </Page>
    )
}
