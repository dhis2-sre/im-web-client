import {
    Button,
    ButtonStrip,
    Center,
    CircularLoader,
    colors,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    IconAdd24,
    NoticeBox,
    IconWorld24,
} from '@dhis2/ui'
import type { FC } from 'react'
import { MomentExpiresFromNow } from '../../../components';
import Moment from 'react-moment';
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { GroupsWithDeployments } from '../../../types'
import styles from './instances-list.module.css'
import { Heading } from '../../../components'
import InstanceTag from './instance-tag'
import { OpenButton } from './open-button';
import { DeleteButton } from './delete-menu-button';
export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDeployments[]>('/deployments', {
        useCache: false,
    })
    return (
        <div className={styles.wrapper}>
            <Heading title="All instances">
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
                </Button>
            </Heading>

            {error && !data && (
                <NoticeBox error title="Could not retrieve instances">
                    {error.message}
                </NoticeBox>
            )}

            {loading && (
                <Center className={styles.loaderWrap}>
                    <CircularLoader />
                </Center>
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
                                <DataTableColumnHeader>Description</DataTableColumnHeader>
                                <DataTableColumnHeader>Components</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>
                            {group.deployments?.map((deployment) => (
                                <DataTableRow className={styles.clickableRow} key={deployment.id} onClick={() => navigate(`/instances/${deployment.id}/details`, { state: deployment })}>
                                    <DataTableCell>
                                        <span className={styles.verticallyAlignedCellContent}>
                                            {deployment.name} {deployment.public && <IconWorld24 color={colors.grey600} />}
                                        </span>
                                    </DataTableCell>
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
                                            <OpenButton hostname={group.hostname} name={deployment.name} />
                                            <DeleteButton id={deployment.id} displayName={deployment.name} onComplete={refetch} />
                                        </ButtonStrip>
                                    </DataTableCell>
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                    ))}
                </DataTable>
            )}
        </div>
    )
}
