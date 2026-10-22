import { Button, DataTable, DataTableBody as TableBody, DataTableCell, DataTableColumnHeader, DataTableHead as TableHead, DataTableRow, IconCheckmark16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import Moment from 'react-moment'
import { useParams } from 'react-router-dom'
import { Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/generated/models/Group.ts'
import { EditGroupModal } from './edit-group-modal.tsx'

export const GroupDetails: FC = () => {
    const { name } = useParams<{ name: string }>()
    const [showEditModal, setShowEditModal] = useState(false)

    const [{ data: group, loading, error }, refetch] = useAuthAxios<Group>(`/groups/${name}/details`, { useCache: false })

    return (
        <Page
            parent={{ label: 'Groups', to: '/groups' }}
            title={group?.name || name || 'Group'}
            actions={group && <Button onClick={() => setShowEditModal(true)}>Edit</Button>}
            loading={loading}
            error={error ? { title: 'Could not fetch group details', description: error.message } : undefined}
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
                        <DataTableCell>Namespace</DataTableCell>
                        <DataTableCell>{group?.namespace}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Hostname</DataTableCell>
                        <DataTableCell>{group?.hostname}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Description</DataTableCell>
                        <DataTableCell>{group?.description}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Deployable</DataTableCell>
                        <DataTableCell>{group?.deployable ? <IconCheckmark16 /> : null}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Cluster</DataTableCell>
                        <DataTableCell>{group?.cluster?.name}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Created</DataTableCell>
                        <DataTableCell>{group?.createdAt && <Moment date={group.createdAt} fromNow />}</DataTableCell>
                    </DataTableRow>
                    <DataTableRow>
                        <DataTableCell>Updated</DataTableCell>
                        <DataTableCell>{group?.updatedAt && <Moment date={group.updatedAt} fromNow />}</DataTableCell>
                    </DataTableRow>
                </TableBody>
            </DataTable>

            {showEditModal && group && (
                <EditGroupModal
                    group={group}
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
