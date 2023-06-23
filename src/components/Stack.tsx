import {
    DataTableToolbar as TableToolbar,
    DataTable,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    DataTableBody as TableBody,
} from '@dhis2/ui'
import { getStack } from '../api/stacks'
import { Stack } from '../types/stack'
import { useParams } from 'react-router-dom'
import { useApi } from '../api/useApi'
import styles from './StackDetails.module.css'
import { useEffect } from 'react'

const StackDetails = () => {
    const { name } = useParams()
    const {
        data: stack,
        isLoading,
        isFetching,
        refetch,
    } = useApi<Stack>(getStack, { name })

    useEffect(() => {
        if (!isFetching && stack && name !== stack.name) {
            refetch()
        }
    }, [name, stack, isFetching, refetch])

    if (isLoading) {
        return null
    }

    return (
        <div key={stack.name}>
            <h1>{stack.name}</h1>

            <>
                <TableToolbar className={styles.tabletoolbar}>
                    Required parameters
                </TableToolbar>
                <DataTable className={styles.datatable}>
                    <TableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>Name</DataTableColumnHeader>
                            <DataTableColumnHeader>
                                Consumed
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>Stack</DataTableColumnHeader>
                        </DataTableRow>
                    </TableHead>

                    <TableBody>
                        {stack.requiredParameters?.map((parameter) => {
                            return (
                                <DataTableRow key={parameter.name}>
                                    <DataTableCell>
                                        {parameter.name}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {parameter.consumed.toString()}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {parameter.stackName}
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })}
                    </TableBody>
                </DataTable>
            </>

            <>
                <TableToolbar className={styles.tabletoolbar}>
                    Optional parameters
                </TableToolbar>
                <DataTable className={styles.datatable}>
                    <TableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>Name</DataTableColumnHeader>
                            <DataTableColumnHeader>
                                Default value
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                Consumed
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>Stack</DataTableColumnHeader>
                        </DataTableRow>
                    </TableHead>

                    <TableBody>
                        {stack.optionalParameters?.map((parameter) => {
                            return (
                                <DataTableRow key={parameter.name}>
                                    <DataTableCell>
                                        {parameter.name}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {parameter.defaultValue}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {parameter.consumed.toString()}
                                    </DataTableCell>
                                    <DataTableCell>
                                        {parameter.stackName}
                                    </DataTableCell>
                                </DataTableRow>
                            )
                        })}
                    </TableBody>
                </DataTable>
            </>
            {!stack && <p>no stack</p>}
        </div>
    )
}

export default StackDetails
