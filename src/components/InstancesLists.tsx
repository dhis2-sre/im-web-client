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
    Tag,
} from '@dhis2/ui'
import { useNavigate } from 'react-router-dom'
import { getInstances, resetInstance, restartInstance, streamLogs } from '../api'
import { useApi } from '../api/useApi'
import { Instance, InstancesGroup } from '../types'
import styles from './InstancesLists.module.css'
import DeleteInstance from './DeleteInstance'
import Moment from 'react-moment'
import { useCallback, useState } from 'react'
import { useAuthHeader } from 'react-auth-kit'

const InstancesList = () => {
    const navigate = useNavigate()
    const { data: instancesGroups, refetch } = useApi<InstancesGroup>(getInstances)
    const getUrl = (instance: Instance, hostname: string) => `https://${hostname}/${instance.name}`
    const getAuthHeader = useAuthHeader()

    const [error, setError] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const reset = useCallback(
        async (instance) => {
            if (!window.confirm(`Are you sure you wish to reset "${instance.groupName}/${instance.name}"?`)) {
                return
            }

            const authHeader = getAuthHeader()
            try {
                setIsUpdating(true)
                await resetInstance(authHeader, instance.id)
                await refetch()
            } catch (error) {
                setError(error.response?.data ?? error.message ?? 'Unknown error')
            } finally {
                setIsUpdating(false)
            }
        },
        [getAuthHeader, refetch]
    )

    const [log, setLog] = useState('')
    const logs = useCallback(
        async (id) => {
            const authHeader = getAuthHeader()
            await streamLogs(authHeader, id, (progressEvent) => {
                const response = progressEvent.event.currentTarget.response
                console.log(response)
                setLog(response)
            })
        },
        [getAuthHeader, setLog]
    )

    const restart = useCallback(
        async (instance) => {
            if (!window.confirm(`Are you sure you wish to restart "${instance.groupName}/${instance.name}"?`)) {
                return
            }

            const authHeader = getAuthHeader()
            try {
                setIsUpdating(true)
                await restartInstance(authHeader, instance.id)
                await refetch()
            } catch (error) {
                setError(error.response?.data ?? error.message ?? 'Unknown error')
            } finally {
                setIsUpdating(false)
            }
        },
        [getAuthHeader, refetch]
    )

    const calculateExpiration = (instance) => new Date(instance.createdAt).getTime() + instance.ttl * 1000

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/new')}>
                    New instance
                </Button>
            </div>

            {error && <Help error>{error}</Help>}

            {instancesGroups && <h3>No instances</h3>}

            {instancesGroups?.map((group) => {
                return (
                    <div key={group.name}>
                        <TableToolbar className={styles.tabletoolbar}>{group.name}</TableToolbar>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Status</DataTableColumnHeader>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                    <DataTableColumnHeader>Type</DataTableColumnHeader>
                                    <DataTableColumnHeader>Expires</DataTableColumnHeader>
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
                                            <DataTableCell>{instance.name}</DataTableCell>
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
                                                <span className={styles.opendeletewrap}>
                                                    <Button small onClick={() => window?.open(getUrl(instance, group.hostname))}>
                                                        Open
                                                    </Button>
                                                    <Button small loading={isUpdating} disabled={isUpdating} onClick={() => restart(instance)}>
                                                        Restart
                                                    </Button>
                                                    <div className={styles.buttonSeparator}>&nbsp;</div>
                                                    <DeleteInstance instance={instance} onDelete={refetch} />
                                                    <Button small secondary loading={isUpdating} disabled={isUpdating} onClick={() => reset(instance)}>
                                                        Reset
                                                    </Button>
                                                    <Button small secondary loading={isUpdating} disabled={isUpdating} onClick={() => logs(instance.id)}>
                                                        Logs
                                                    </Button>
                                                </span>
                                            </DataTableCell>
                                        </DataTableRow>
                                    )
                                })}
                            </TableBody>
                        </DataTable>
                        <pre>{log}</pre>
                    </div>
                )
            })}
        </div>
    )
}

export default InstancesList
