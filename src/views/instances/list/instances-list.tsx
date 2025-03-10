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
    NoticeBox,
    Checkbox,
} from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { Heading, MomentExpiresFromNow } from '../../../components/index.ts'
import { DeleteButton } from './delete-menu-button.tsx'
import useDeployments from './filter-deployments.tsx'
import InstanceTag from './instance-tag.tsx'
import styles from './instances-list.module.css'
import { OpenButton } from './open-button.tsx'
export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const { data, error, loading, refetch, showOnlyMyInstances, setShowOnlyMyInstances } = useDeployments()

    return (
        <div className={styles.wrapper}>
            <Heading title="All instances">
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
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
                                <DataTableColumnHeader>Status</DataTableColumnHeader>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>

                            {group?.deployments?.map((deployment) => (
                                <tr className={styles.clickableRow} key={deployment.id} onClick={() => navigate(`/instances/${deployment.id}/details`, { state: deployment })}>
                                    <DataTableCell>
                                        {deployment.instances?.map(({ stackName, id }) => <InstanceTag key={stackName} instanceId={id} stackName={stackName} />)}
                                    </DataTableCell>
                                    <DataTableCell>{deployment.name}</DataTableCell>
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
                                            <OpenButton hostname={group.hostname} name={deployment.name} />
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
