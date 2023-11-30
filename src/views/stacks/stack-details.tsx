import { Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, DataTableToolbar, NoticeBox } from '@dhis2/ui'
import { useParams } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import { Stack } from '../../types'
import styles from './stack-details.module.css'

export const StackDetails = () => {
    const { name } = useParams()
    const [{ data: stack, loading, error }] = useAuthAxios<Stack>(`stacks/${name}`)

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Could not fetch stack details">
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <div key={stack.name}>
            <h1>{stack.name}</h1>
            <DataTableToolbar className={styles.tabletoolbar}>Parameters</DataTableToolbar>
            <DataTable className={styles.datatable}>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Parameter name</DataTableColumnHeader>
                        <DataTableColumnHeader>Default value</DataTableColumnHeader>
                        <DataTableColumnHeader>Consumed</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>

                <DataTableBody>
                    {stack.parameters
                        ?.sort((a, b) => (a.priority < b.priority ? -1 : 1))
                        .map((parameter) => {
                            return (
                                <DataTableRow key={parameter.name}>
                                    <DataTableCell>{parameter.name}</DataTableCell>
                                    <DataTableCell>{parameter.parameterName}</DataTableCell>
                                    <DataTableCell>{parameter.defaultValue}</DataTableCell>
                                    <DataTableCell>{parameter.consumed.toString()}</DataTableCell>
                                </DataTableRow>
                            )
                        })}
                </DataTableBody>
            </DataTable>
            <DataTableToolbar className={styles.tabletoolbar}>Requires</DataTableToolbar>
            <DataTable className={styles.datatable}>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>

                <DataTableBody>
                    {stack.requires
                        ?.sort((a, b) => (a.name < b.name ? -1 : 1))
                        .map((parameter) => {
                            return (
                                <DataTableRow key={parameter.name}>
                                    <DataTableCell>{parameter.name}</DataTableCell>
                                </DataTableRow>
                            )
                        })}
                </DataTableBody>
            </DataTable>
        </div>
    )
}
