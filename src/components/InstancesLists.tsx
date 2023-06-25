import {
    Button,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
    Help,
    IconAdd24,
    IconDelete16,
    IconLaunch16,
    Tag,
} from '@dhis2/ui'
import {useNavigate} from 'react-router-dom'
import {getInstances, resetInstance} from '../api'
import {useApi} from '../api/useApi'
import {Instance, InstancesGroup} from '../types'
import styles from './InstancesLists.module.css'
import DeleteInstance from './DeleteInstance'
import Moment from "react-moment"
import {useCallback, useState} from "react";
import {useAuthHeader} from "react-auth-kit";

const InstancesList = () => {
    const navigate = useNavigate()
    const { data: instancesGroups, refetch } = useApi<InstancesGroup>(getInstances)
    const getUrl = (instance: Instance, hostname: string) => `https://${hostname}/${instance.name}`
    const getAuthHeader = useAuthHeader()

    const [error, setError] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const resetInstanceCallback = useCallback(async (instance) => {
            if (!window.confirm(`Are you sure you wish to reset "${instance.groupName}/${instance.name}"?`)) {
                return
            }

            const authHeader = getAuthHeader()
            try {
                setIsUpdating(true)
                await resetInstance(authHeader, instance.id)
                await refetch()
            } catch (error) {
                setError(error.response?.data ?? error.message ?? 'Unknown login error')
            } finally {
                setIsUpdating(false)
            }
        }, [getAuthHeader, refetch]
    )

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/new')}>
                    New instance
                </Button>
            </div>

            {error && <Help error>{error}</Help>}

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
                                                <Moment date={instance.createdAt} fromNow/>
                                            </DataTableCell>
                                            <DataTableCell>
                                                <Moment date={instance.updatedAt} fromNow/>
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.user.email}
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
                                                    <Button small destructive loading={isUpdating}
                                                            disabled={isUpdating} icon={<IconDelete16/>}
                                                            onClick={() => resetInstanceCallback(instance)}>Reset</Button>
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
