import {
    Button,
    ButtonStrip,
    colors,
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
} from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { GroupsWithInstances, Instance } from '../../../types'
import { OpenButton } from './open-button'
import { StatusLabel } from './status-label'
import styles from './instances-list.module.css'
import { ActionsDropdownMenu } from './actions-dropdown-menu'

const calculateExpiration = (instance: Instance) => new Date(instance.createdAt).getTime() + instance.ttl * 1000

export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const [{ data, error }, refetch] = useAuthAxios<GroupsWithInstances[]>('instances', {
        useCache: false,
    })

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new-dhis2')}>
                    New DHIS2 instance
                </Button>
                <NavLink to="/instances/new">New custom instance</NavLink>
            </div>

            {error && (
                <NoticeBox error title="Could not retrieve instances">
                    {error.message}
                </NoticeBox>
            )}

            {data?.length < 1 && <h3>No instances</h3>}

            {data?.map((group) => {
                return (
                    <div key={group.name}>
                        <DataTableToolbar className={styles.tabletoolbar}>{group.name}</DataTableToolbar>
                        <DataTable>
                            <DataTableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Description</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                                    <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>
                            </DataTableHead>

                            <DataTableBody>
                                {group.instances?.map((instance) => {
                                    return (
                                        <DataTableRow key={instance.id}>
                                            <DataTableCell>
                                                <StatusLabel instanceId={instance.id} />
                                            </DataTableCell>
                                            <DataTableCell>
                                                <span className={styles.verticallyAlignedCellContent}>
                                                    {instance.name} {instance.public && <IconWorld24 color={colors.grey600} />}
                                                </span>
                                            </DataTableCell>
                                            <DataTableCell>{instance.description}</DataTableCell>
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
                                                <ButtonStrip>
                                                    <OpenButton hostname={group.hostname} instanceName={instance.name} />
                                                    <ActionsDropdownMenu id={instance.id} name={instance.name} refreshList={refetch} />
                                                </ButtonStrip>
                                            </DataTableCell>
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
