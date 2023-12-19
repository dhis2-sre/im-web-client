import {
    Button,
    ButtonStrip,
    Center,
    CircularLoader,
    colors,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    IconAdd24,
    IconWorld24,
    NoticeBox,
    Tag,
} from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { Deployment, GroupsWithDeployments } from '../../../types'
import { OpenButton } from './open-button'
import { StatusLabel } from './status-label'
import styles from './instances-list.module.css'
import { ActionsDropdownMenu } from './actions-dropdown-menu'

type CustomizedDeployment = Deployment & {
    public: boolean
    ttl: number
}
interface CustomizedGroupsWithDeployments extends GroupsWithDeployments {
    deployments?: Array<CustomizedDeployment>
}

const calculateExpiration = (deployment: CustomizedDeployment) => new Date(deployment.createdAt).getTime() + deployment.ttl * 1000

export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const [{ data, error, loading }, refetch] = useAuthAxios<CustomizedGroupsWithDeployments[]>('/deployments', {
        useCache: false,
    })

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
                </Button>
            </div>

            {error && (
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
                    {data?.map((group) => {
                        return (
                            <>
                                <DataTableRow>
                                    <DataTableCell colspan="9">
                                        <h2 className={styles.groupName}>{group.name}</h2>
                                    </DataTableCell>
                                </DataTableRow>
                                <DataTableRow>
                                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Description</DataTableColumnHeader>
                                    <DataTableColumnHeader>Components</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                    <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>

                                {group.deployments?.map((deployment) => {
                                    return (
                                        <DataTableRow key={deployment.id}>
                                            <DataTableCell>
                                                <StatusLabel instanceId={deployment.id} />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <span className={styles.verticallyAlignedCellContent}>
                                                    {deployment.name} {deployment.public && <IconWorld24 color={colors.grey600} />}
                                                </span>
                                            </DataTableCell>
                                            <DataTableCell>{deployment.description}</DataTableCell>
                                            <DataTableCell>
                                                {deployment.instances?.map(({ stackName }) => (
                                                    <Tag className={styles.stackNameTag}>{stackName}</Tag>
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
                                                <Moment date={calculateExpiration(deployment)} fromNow />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <ButtonStrip>
                                                    <OpenButton hostname={group.hostname} instanceName={deployment.name} />
                                                    <ActionsDropdownMenu id={deployment.id} name={deployment.name} refreshList={refetch} />
                                                </ButtonStrip>
                                            </DataTableCell>
                                        </DataTableRow>
                                    )
                                })}
                            </>
                        )
                    })}
                </DataTable>
            )}
        </div>
    )
}
