import { Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, NoticeBox } from '@dhis2/ui'
import { Link } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Stack } from '../../types/index.ts'

export const StacksList = () => {
    const [{ data, loading, error }] = useAuthAxios<Stack[]>('/stacks')

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Could not fetch list of stacks">
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <div>
            <Heading title="List of Stacks" />
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {data.map((stack) => (
                        <DataTableRow key={stack.name}>
                            <DataTableCell>
                                <Link to={`/stacks/${stack.name}`}>{stack.name}</Link>
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </DataTableBody>
            </DataTable>
        </div>
    )
}
