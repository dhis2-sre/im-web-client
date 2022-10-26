import {
    DataTableToolbar as TableToolbar,
    DataTable,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableCell,
    DataTableBody as TableBody,
} from '@dhis2/ui'
import React from 'react'
import { getStack } from '../api/stacks'
import { Stack } from '../types/stack'
import { useParams } from 'react-router'
import { useApi } from '../api/useApi'

const StackDetails = () => {
    const { name } = useParams()
    const { result: stack } = useApi<Stack>(getStack, { name })

    return (
        <div key={stack?.name}>
            <h1>{stack?.name}</h1>

            <>
                <TableToolbar>
                    <p>Required parameters</p>
                </TableToolbar>
                <DataTable>
                    <TableHead>
                        <DataTableRow>
                            <DataTableCell>Name</DataTableCell>
                            <DataTableCell>Consumed</DataTableCell>
                            <DataTableCell>Stack</DataTableCell>
                        </DataTableRow>
                    </TableHead>

                    <TableBody>
                        {stack?.requiredParameters?.map((parameter) => {
                            return (
                                <DataTableRow>
                                    <DataTableCell>{parameter.Name}</DataTableCell>
                                    <DataTableCell>{parameter.Consumed.toString()}</DataTableCell>
                                    <DataTableCell>{parameter.StackName}</DataTableCell>
                                </DataTableRow>
                            )
                        })}
                    </TableBody>
                </DataTable>
            </>

            <>
                <TableToolbar>
                    <p>Required parameters</p>
                </TableToolbar>
                <DataTable>
                    <TableHead>
                        <DataTableRow>
                            <DataTableCell>Name</DataTableCell>
                            <DataTableCell>Default value</DataTableCell>
                            <DataTableCell>Consumed</DataTableCell>
                            <DataTableCell>Stack</DataTableCell>
                        </DataTableRow>
                    </TableHead>

                    <TableBody>
                        {stack?.optionalParameters?.map((parameter) => {
                            return (
                                <DataTableRow>
                                    <DataTableCell>{parameter.Name}</DataTableCell>
                                    <DataTableCell>{parameter.DefaultValue}</DataTableCell>
                                    <DataTableCell>{parameter.Consumed.toString()}</DataTableCell>
                                    <DataTableCell>{parameter.StackName}</DataTableCell>
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
