import {
    Button,
    IconAdd24,
    IconLaunch16,
    DataTableToolbar as TableToolbar,
    DataTable,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
    DataTableBody as TableBody,
} from '@dhis2/ui'
import { useNavigate } from 'react-router-dom'
import { getInstances } from '../api'
import { useApi } from '../api/useApi'
import { InstancesGroup, Instance } from '../types'
import styles from './InstancesLists.module.css'
import DeleteInstance from './DeleteInstance'

export const getRelativeDate = (dateString: string, format = 'hours') => {
    try {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

        const hours = Math.ceil(
            Math.abs(Date.parse(dateString) - Date.now()) / (1000 * 60 * 60)
        )

        const days = Math.ceil(
            Math.abs(Date.parse(dateString) - Date.now()) /
                (1000 * 60 * 60 * 24)
        )

        if (format === 'days') {
            return rtf.format(-days, 'days')
        }
        return rtf.format(-hours, 'hours')
    } catch (err) {
        console.error(err)
        return dateString
    }
}

const InstancesList = () => {
    const navigate = useNavigate()
    const { data: instancesGroups, refetch } = useApi<InstancesGroup>(getInstances)
    const getUrl = (instance: Instance, hostname: string) => `https://${hostname}/${instance.name}`

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/new')}>
                    New instance
                </Button>
            </div>

            {instancesGroups?.map((group) => {
                return (
                    <div key={group.name}>
                        <TableToolbar className={styles.tabletoolbar}>
                            {group.name}
                        </TableToolbar>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>
                                        Status
                                    </DataTableColumnHeader>
                                    <DataTableColumnHeader>
                                        Name
                                    </DataTableColumnHeader>
                                    <DataTableColumnHeader>
                                        Created
                                    </DataTableColumnHeader>
                                    <DataTableColumnHeader>
                                        Updated
                                    </DataTableColumnHeader>
                                    <DataTableColumnHeader>
                                        Owner
                                    </DataTableColumnHeader>
                                    <DataTableColumnHeader>
                                        Type
                                    </DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>
                            </TableHead>

                            <TableBody>
                                {group.instances?.map((instance) => {
                                    return (
                                        <DataTableRow key={instance.id}>
                                            <DataTableCell>
                                                <Tag positive>Running</Tag>
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.name}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {getRelativeDate(
                                                    instance.createdAt
                                                )}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {getRelativeDate(
                                                    instance.updatedAt
                                                )}
                                            </DataTableCell>
                                            <DataTableCell>
                                                hacker-{instance.userId}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.stackName}
                                            </DataTableCell>
                                            <DataTableCell>
                                                <span
                                                    className={
                                                        styles.opendeletewrap
                                                    }
                                                >
                                                    <Button
                                                        small
                                                        primary
                                                        icon={<IconLaunch16 />}
                                                        onClick={() =>
                                                            window?.open(
                                                                getUrl(
                                                                    instance,
                                                                    group.hostname
                                                                )
                                                            )
                                                        }
                                                    >
                                                        Open
                                                    </Button>
                                                    <DeleteInstance
                                                        instanceId={instance.id}
                                                        onDelete={refetch}
                                                    />
                                                </span>
                                            </DataTableCell>
                                        </DataTableRow>
                                    )
                                })}
                            </TableBody>
                        </DataTable>
                    </div>
                )
            })}
        </div>
    )
}

export default InstancesList
