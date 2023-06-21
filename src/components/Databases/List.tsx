import {
    Button,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
    IconAdd24,
} from '@dhis2/ui'
import {useNavigate} from 'react-router-dom'
import {useApi} from '../../api/useApi'
import styles from './List.module.css'
import {GroupWithDatabases} from "../../types";
import {getDatabases} from "../../api";

const ListDatabases = () => {
    const navigate = useNavigate()

    const {data: groupWithDatabases} = useApi<GroupWithDatabases>(getDatabases)

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All databases</h1>
                <Button icon={<IconAdd24/>} onClick={() => navigate('/new')}>Upload databases</Button>
            </div>

            {groupWithDatabases?.map((group) => {
                return (
                    <div key={group.Name}>
                        <TableToolbar className={styles.tabletoolbar}>{group.Name}</TableToolbar>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>
                            </TableHead>
                            <TableBody>
                                {group.Databases?.map(database => {
                                    return (
                                        <DataTableRow key={database.ID}>
                                            <DataTableCell>{database.Name}</DataTableCell>
                                            <DataTableCell>{database.CreatedAt}</DataTableCell>
                                            <DataTableCell>{database.UpdatedAt}</DataTableCell>
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

export default ListDatabases
