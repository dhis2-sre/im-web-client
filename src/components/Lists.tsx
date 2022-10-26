import {
    Button,
    IconAdd24,
    DataTableToolbar as TableToolbar,
    DataTable,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Tag,
    DataTableBody as TableBody,
} from '@dhis2/ui'
import { useNavigate } from 'react-router'
import { getInstances } from '../api'
import { useApi } from '../api/useApi'
import { InstancesGroup, Instance } from '../types'
import styles from './Lists.module.css'

const InstancesList = () => {
    const navigate = useNavigate()

    const { result: instancesGroups } = useApi<InstancesGroup>(getInstances)

    const getUrl = (instance: Instance, hostName: string) => {
        return `https://${hostName}/${instance.Name}`
    }

    const getRelativeDate = (dateString: string) => {
        try {
            const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

            const hours = Math.ceil(
                Math.abs(Date.parse(dateString) - Date.now()) / (1000 * 60 * 60)
            )

            return rtf.format(-hours, 'hours')
        } catch (err) {
            console.error(err)
            return dateString
        }
    }
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
                    <div key={group.Name}>
                        <TableToolbar className={styles.tabletoolbar}>
                            {group.Name}
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
                                {group.Instances?.map((instance) => {
                                    return (
                                        <DataTableRow key={instance.ID}>
                                            <DataTableCell>
                                                <Tag positive>Running</Tag>
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.Name}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {getRelativeDate(
                                                    instance.CreatedAt
                                                )}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {getRelativeDate(
                                                    instance.UpdatedAt
                                                )}
                                            </DataTableCell>
                                            <DataTableCell>
                                                hacker-{instance.UserID}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.StackName}
                                            </DataTableCell>
                                            <DataTableCell>
                                                <a
                                                    target="_blank"
                                                    href={getUrl(
                                                        instance,
                                                        group.Hostname
                                                    )}
                                                    rel="noreferrer"
                                                >
                                                    Open
                                                </a>
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
