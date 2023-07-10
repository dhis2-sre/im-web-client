import {
    Button,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    DataTableToolbar,
    IconAdd24,
    IconWorld24,
    NoticeBox,
    Tag,
} from '@dhis2/ui'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import { GroupWithInstances, Instance } from '../../types'
import { DeleteButton } from './delete-button'
import styles from './instances-list.module.css'
import { OpenButton } from './open-button'
import { ResetButton } from './reset-button'
import { RestartButton } from './restart-button'

const calculateExpiration = (instance: Instance) => new Date(instance.createdAt).getTime() + instance.ttl * 1000

export const InstancesList = () => {
    const navigate = useNavigate()
    const [{ data: instancesGroups, error }, fetchInstancesGroups] = useAuthAxios<GroupWithInstances[]>('instances')

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/new')}>
                    New instance
                </Button>
            </div>

            {error && (
                <NoticeBox error title="Could not fetch the log">
                    {error.message}
                </NoticeBox>
            )}

            {instancesGroups?.length < 1 && <h3>No instances</h3>}

            {instancesGroups?.map((group) => {
                return (
                    <div key={group.name}>
                        <DataTableToolbar className={styles.tabletoolbar}>{group.name}</DataTableToolbar>
                        <DataTable>
                            <DataTableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                                    <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>
                            </DataTableHead>

                            <DataTableBody>
                                {group.instances?.map((instance) => {
                                    return (
                                        <DataTableRow key={instance.id}>
                                            <DataTableCell>
                                                <Tag positive>Running</Tag>
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.name} {instance.public === true ? <IconWorld24 /> : <></>}
                                            </DataTableCell>
                                            <DataTableCell>
                                                <Moment date={instance.createdAt} fromNow />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <Moment date={instance.updatedAt} fromNow />
                                            </DataTableCell>
                                            <DataTableCell>{instance.user.email}</DataTableCell>
                                            <DataTableCell>{instance.stackName}</DataTableCell>
                                            <DataTableCell>
                                                <Moment date={calculateExpiration(instance)} fromNow />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <OpenButton hostname={group.hostname} instanceName={instance.name} />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <RestartButton
                                                    instanceId={instance.id}
                                                    instanceName={instance.name}
                                                    onComplete={fetchInstancesGroups}
                                                />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <DeleteButton
                                                    instanceId={instance.id}
                                                    instanceName={instance.name}
                                                    onComplete={fetchInstancesGroups}
                                                />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <ResetButton
                                                    instanceId={instance.id}
                                                    instanceName={instance.name}
                                                    onComplete={fetchInstancesGroups}
                                                />
                                            </DataTableCell>
                                            <DataTableCell></DataTableCell>
                                        </DataTableRow>
                                    )
                                })}
                            </DataTableBody>
                        </DataTable>
                    </div>
                )
            })}
        </div>
    )
}