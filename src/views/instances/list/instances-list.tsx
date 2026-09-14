import { Button, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableRow, IconAdd24, NoticeBox, Checkbox } from '@dhis2/ui'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { DeploymentRow } from './deployment-row.tsx'
import useDeployments from './filter-deployments.tsx'
import styles from './instances-list.module.css'
export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const { data, error, loading, refetch, showOnlyMyInstances, setShowOnlyMyInstances } = useDeployments()

    return (
        <div className={styles.wrapper}>
            <Heading title="All instances">
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
                </Button>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance (v2)
                </Button>
                <Checkbox checked={showOnlyMyInstances} label="Show only my instances" onChange={() => setShowOnlyMyInstances(!showOnlyMyInstances)} />
            </Heading>

            {error && !data && (
                <NoticeBox error title="Could not retrieve instances">
                    {error.message}
                </NoticeBox>
            )}

            {data?.length === 0 && <h3>No instances</h3>}

            {data?.length > 0 && (
                <DataTable>
                    {data?.map((group) => (
                        <DataTableBody key={group.name}>
                            <DataTableRow>
                                <DataTableCell staticStyle colSpan="9">
                                    <h2 className={styles.groupName}>{group.name}</h2>
                                </DataTableCell>
                            </DataTableRow>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Status</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>

                            {group.deployments?.map((deployment) => (
                                <DeploymentRow
                                    key={deployment.id}
                                    deployment={deployment}
                                    onNavigate={(target) => navigate(`/instances/${target.id}/details`, { state: target })}
                                    refetch={refetch}
                                />
                            ))}
                        </DataTableBody>
                    ))}
                </DataTable>
            )}

            {loading && (
                <Center className={styles.loaderWrap}>
                    <CircularLoader />
                </Center>
            )}
        </div>
    )
}
