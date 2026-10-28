import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import { Link } from 'react-router-dom'
import { Page } from '../../components/index.ts'
import { useStacks } from '../../hooks/index.ts'

export const StacksList = () => {
    const { stacks, loading, error } = useStacks()

    return (
        <Page title="Stacks" loading={loading} error={error ? { title: 'Could not fetch list of stacks', description: error.message } : undefined}>
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {stacks.map((stack) => (
                        <DataTableRow key={stack.name}>
                            <DataTableCell>
                                <Link to={`/stacks/${stack.name}`}>{stack.name}</Link>
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </DataTableBody>
            </DataTable>
        </Page>
    )
}
