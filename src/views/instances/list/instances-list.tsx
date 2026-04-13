import {
    Button,
    ButtonStrip,
    Center,
    CircularLoader,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    IconAdd24,
    InputField,
    NoticeBox,
    Checkbox,
} from '@dhis2/ui'
import { useState, useMemo, type FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { Heading, MomentExpiresFromNow } from '../../../components/index.ts'
import { Deployment } from '../../../types/index.ts'
import { DeleteButton } from './delete-menu-button.tsx'
import useDeployments from './filter-deployments.tsx'
import InstanceTag from './instance-tag.tsx'
import styles from './instances-list.module.css'
import { OpenButton } from './open-button.tsx'

type SortField = 'name' | 'description' | 'created' | 'updated' | 'owner' | 'expires'
type SortDirection = 'asc' | 'desc'

const compareByField = (a: Deployment, b: Deployment, field: SortField): number => {
    switch (field) {
        case 'name':
            return (a.name ?? '').localeCompare(b.name ?? '')
        case 'description':
            return (a.description ?? '').localeCompare(b.description ?? '')
        case 'created':
            return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
        case 'updated':
            return (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '')
        case 'owner':
            return (a.user?.email ?? '').localeCompare(b.user?.email ?? '')
        case 'expires': {
            const aExpires = new Date(a.createdAt).getTime() / 1000 + a.ttl || 0
            const bExpires = new Date(b.createdAt).getTime() / 1000 + b.ttl || 0
            return aExpires - bExpires
        }
        default:
            return 0
    }
}

export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const { data, error, loading, refetch, showOnlyMyInstances, setShowOnlyMyInstances, searchTerm, setSearchTerm } = useDeployments()

    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const sortedData = useMemo(() => {
        if (!data || !sortField) {
            return data
        }
        return data.map((group) => ({
            ...group,
            deployments: [...group.deployments].sort((a, b) => {
                const cmp = compareByField(a, b, sortField)
                return sortDirection === 'asc' ? cmp : -cmp
            }),
        }))
    }, [data, sortField, sortDirection])

    const sortIndicator = (field: SortField) => (sortField === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : '')

    return (
        <div className={styles.wrapper}>
            <Heading title="All instances">
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
                </Button>
                <Checkbox checked={showOnlyMyInstances} label="Show only my instances" onChange={() => setShowOnlyMyInstances(!showOnlyMyInstances)} />
                <InputField placeholder="Search instances..." value={searchTerm} onChange={({ value }) => setSearchTerm(value)} dense className={styles.searchInput} />
            </Heading>

            {error && !data && (
                <NoticeBox error title="Could not retrieve instances">
                    {error.message}
                </NoticeBox>
            )}

            {sortedData?.length === 0 && <h3>No instances</h3>}

            {sortedData?.length > 0 && (
                <DataTable>
                    {sortedData?.map((group) => (
                        <DataTableBody key={group.name}>
                            <DataTableRow>
                                <DataTableCell staticStyle colSpan="9">
                                    <h2 className={styles.groupName}>{group.name}</h2>
                                </DataTableCell>
                            </DataTableRow>
                            <DataTableRow>
                                <DataTableColumnHeader>
                                    <span className={styles.sortableHeader} onClick={() => handleSort('name')}>
                                        Name{sortIndicator('name')}
                                    </span>
                                </DataTableColumnHeader>
                                <DataTableColumnHeader>
                                    <span className={styles.sortableHeader} onClick={() => handleSort('description')}>
                                        Description{sortIndicator('description')}
                                    </span>
                                </DataTableColumnHeader>
                                <DataTableColumnHeader>Status</DataTableColumnHeader>
                                <DataTableColumnHeader>
                                    <span className={styles.sortableHeader} onClick={() => handleSort('created')}>
                                        Created{sortIndicator('created')}
                                    </span>
                                </DataTableColumnHeader>
                                <DataTableColumnHeader>
                                    <span className={styles.sortableHeader} onClick={() => handleSort('updated')}>
                                        Updated{sortIndicator('updated')}
                                    </span>
                                </DataTableColumnHeader>
                                <DataTableColumnHeader>
                                    <span className={styles.sortableHeader} onClick={() => handleSort('owner')}>
                                        Owner{sortIndicator('owner')}
                                    </span>
                                </DataTableColumnHeader>
                                <DataTableColumnHeader>
                                    <span className={styles.sortableHeader} onClick={() => handleSort('expires')}>
                                        Expires{sortIndicator('expires')}
                                    </span>
                                </DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>

                            {group.deployments?.map((deployment) => (
                                <tr
                                    className={styles.clickableRow}
                                    key={deployment.id}
                                    onClick={(e) => {
                                        if (!e.currentTarget.contains(e.target as Node)) {
                                            return
                                        }
                                        navigate(`/instances/${deployment.id}/details`, { state: deployment })
                                    }}
                                >
                                    <DataTableCell>{deployment.name}</DataTableCell>
                                    <DataTableCell>{deployment.description}</DataTableCell>
                                    <DataTableCell>
                                        {deployment.instances?.map(({ stackName, id }) => (
                                            <InstanceTag key={stackName} instanceId={id} stackName={stackName} />
                                        ))}
                                    </DataTableCell>
                                    <DataTableCell>
                                        <Moment date={deployment.createdAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <Moment date={deployment.updatedAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>{deployment.user.email}</DataTableCell>
                                    <DataTableCell>
                                        <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <ButtonStrip>
                                            <OpenButton deployment={deployment} />
                                            <DeleteButton id={deployment.id} displayName={deployment.name} onComplete={refetch} />
                                        </ButtonStrip>
                                    </DataTableCell>
                                </tr>
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
