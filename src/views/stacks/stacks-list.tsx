import { Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, NoticeBox } from '@dhis2/ui'
import Moment from 'react-moment'
import { Link } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import { Stack } from '../../types'
import styles from './stacks-list.module.css'

export const StacksList = () => {
    const [{ data: stacks, loading, error }] = useAuthAxios<Stack[]>('stacks')

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
            <div className={styles.heading}>
                <h1>List of Stacks</h1>
            </div>
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Date</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {stacks.map((stack) => {
                        return (
                            <DataTableRow key={stack.name}>
                                <DataTableCell>
                                    <Link to={`/stacks/${stack.name}`}>{stack.name}</Link>
                                </DataTableCell>
                                <DataTableCell>
                                    <Moment date={stack.createdAt} fromNow />
                                </DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </DataTableBody>
            </DataTable>
        </div>
    )
}
