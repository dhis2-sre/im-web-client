import {
    DataTable,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    DataTableBody as TableBody,
} from '@dhis2/ui'

import { Link } from 'react-router-dom'
import { getStacks } from '../api/stacks'
import { Stacks } from '../types/stack'
import { useApi } from '../api/useApi'
import styles from './Stacks.module.css'
import { getRelativeDate } from './InstancesLists'

const StackList = () => {
    const { data: stacks, isLoading } = useApi<Stacks>(getStacks)

    if (isLoading) {
        return null
    }

    return (
        <div>
            <div className={styles.heading}>
                <h1>List of Stacks</h1>
            </div>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Date</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {stacks.map((stack) => {
                        return (
                            <DataTableRow key={stack.name}>
                                <DataTableCell>
                                    <Link to={`/stacks/${stack.name}`}>
                                        {stack.name}
                                    </Link>
                                </DataTableCell>
                                <DataTableCell>
                                    {getRelativeDate(stack.CreatedAt, 'days')}
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </TableBody>
            </DataTable>
        </div>
    )
}

export default StackList
