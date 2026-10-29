import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { MomentFromNow, Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import { NewClusterButton } from './new-cluster-button.tsx'

export const ClustersList: FC = () => {
    const [{ data, loading, error }, refetch] = useAuthAxios<Cluster[]>('/clusters', { useCache: false })

    return (
        <Page
            title="Clusters"
            actions={<NewClusterButton onComplete={refetch} />}
            loading={loading && !data}
            error={error && !data ? { title: 'Could not fetch clusters', description: error.message } : undefined}
        >
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Description</DataTableColumnHeader>
                        <DataTableColumnHeader>Group(s)</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>
                <TableBody>
                    {data?.map((cluster: Cluster) => {
                        return (
                            <DataTableRow key={cluster.id}>
                                <DataTableCell>
                                    <Link to={`/clusters/${cluster.id}`}>{cluster.name}</Link>
                                </DataTableCell>
                                <DataTableCell>{cluster.description}</DataTableCell>
                                <DataTableCell>{cluster.groups?.map((group) => group.name).join(', ')}</DataTableCell>
                                <DataTableCell>
                                    <MomentFromNow date={cluster.createdAt} />
                                </DataTableCell>
                                <DataTableCell>
                                    <MomentFromNow date={cluster.updatedAt} />
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </TableBody>
            </DataTable>
        </Page>
    )
}
