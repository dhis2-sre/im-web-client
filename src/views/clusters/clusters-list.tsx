import { DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import { FC } from 'react'
import Moment from 'react-moment'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import styles from './clusters-list.module.css'
import { NewClusterButton } from './new-cluster-button.tsx'

export const ClustersList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<Cluster[]>('/clusters', { useCache: false })

    return (
        <div className={styles.wrapper}>
            <Heading title="Clusters">
                <NewClusterButton onComplete={refetch} />
            </Heading>
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
                                <DataTableCell>{cluster.name}</DataTableCell>
                                <DataTableCell>{cluster.description}</DataTableCell>
                                <DataTableCell>{cluster.groups?.map((group) => group.name).join(', ')}</DataTableCell>
                                <DataTableCell>
                                    <Moment date={cluster.createdAt} fromNow />
                                </DataTableCell>
                                <DataTableCell>
                                    <Moment date={cluster.updatedAt} fromNow />
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </TableBody>
            </DataTable>
        </div>
    )
}
