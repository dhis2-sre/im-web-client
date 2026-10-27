import { Button, DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import Moment from 'react-moment'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import { EditClusterModal } from './edit-cluster-modal.tsx'

export const ClusterDetails: FC = () => {
    const { id } = useParams<{ id: string }>()
    const [showEditModal, setShowEditModal] = useState(false)

    const [{ data: cluster, loading, error }, refetch] = useAuthAxios<Cluster>(`/clusters/${id}`, { useCache: false })

    return (
        <Page
            parent={{ label: 'Clusters', to: '/clusters' }}
            title={cluster?.name}
            actions={cluster && <Button onClick={() => setShowEditModal(true)}>Edit</Button>}
            loading={loading && !cluster}
            error={error ? { title: 'Could not fetch cluster details', description: error.message } : undefined}
        >
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Field</DataTableColumnHeader>
                        <DataTableColumnHeader>Value</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>
                <TableBody>
                    <DataTableRow>
                        <DataTableCell>Description</DataTableCell>
                        <DataTableCell>{cluster?.description}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Groups</DataTableCell>
                        <DataTableCell>
                            {cluster?.groups?.map((group, i) => (
                                <span key={group.name}>
                                    {i > 0 && ', '}
                                    <Link to={`/groups/${group.name}`}>{group.name}</Link>
                                </span>
                            ))}
                        </DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Created</DataTableCell>
                        <DataTableCell>{cluster?.createdAt && <Moment date={cluster.createdAt} fromNow />}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Updated</DataTableCell>
                        <DataTableCell>{cluster?.updatedAt && <Moment date={cluster.updatedAt} fromNow />}</DataTableCell>
                    </DataTableRow>
                </TableBody>
            </DataTable>

            {showEditModal && cluster && (
                <EditClusterModal
                    cluster={cluster}
                    onComplete={() => {
                        setShowEditModal(false)
                        void refetch()
                    }}
                    onCancel={() => setShowEditModal(false)}
                />
            )}
        </Page>
    )
}
