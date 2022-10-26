import {
    Button,
    IconAdd24,
    DataTableToolbar as TableToolbar,
    DataTable,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableCell,
    Tag,
    DataTableBody as TableBody,
} from '@dhis2/ui'
import { useNavigate } from 'react-router'
import { getInstances } from '../api'
import { useApi } from '../api/useApi'
import { InstancesGroup } from '../types'
import styles from './Lists.module.css'

const InstancesList = () => {
    const navigate = useNavigate()

    const { result: instancesGroups } = useApi<InstancesGroup>(getInstances)

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
                    <>
                        <TableToolbar>
                            <p>{group.Name}</p>
                        </TableToolbar>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableCell>Status</DataTableCell>
                                    <DataTableCell>Name</DataTableCell>
                                    <DataTableCell>Created</DataTableCell>
                                    <DataTableCell>Updated</DataTableCell>
                                    <DataTableCell>Owner</DataTableCell>
                                </DataTableRow>
                            </TableHead>

                            <TableBody>
                                {group.Instances?.map((instance) => {
                                    return (
                                        <DataTableRow>
                                            <DataTableCell>
                                                <Tag positive>Running</Tag>
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.Name}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.CreatedAt}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.UpdatedAt}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {instance.UserID}
                                            </DataTableCell>
                                            <DataTableCell>
                                                Actions - Open
                                            </DataTableCell>
                                        </DataTableRow>
                                    )
                                })}
                            </TableBody>
                        </DataTable>
                    </>
                )
            })}
        </div>
    )
}

export default InstancesList
