import { Center, CircularLoader, NoticeBox, DataTable, TableHead, DataTableRow, DataTableColumnHeader, TableBody, DataTableCell, IconCheckmark16 } from '@dhis2/ui'
import Moment from 'react-moment'
import { useParams } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { User } from '../../types/index.ts'
import { AddToGroupButton } from './add-to-group-button.tsx'
import { RemoveFromGroupButton } from './remove-from-group-button.tsx'

export const UserDetails = () => {
    const { id } = useParams()
    const [{ data: user, loading, error }, refetch] = useAuthAxios<User>(`/users/${id}`)

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Could not fetch user details">
                {error.message}
            </NoticeBox>
        )
    }

    return (
        <div key={user.id}>
            <Heading title={user.email}>
                <AddToGroupButton onComplete={refetch} user={user} />
            </Heading>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Hostname</DataTableColumnHeader>
                        <DataTableColumnHeader>Deployable</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                        <DataTableColumnHeader>Updated</DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {user.groups?.map((group) => (
                        <DataTableRow key={group.name}>
                            <DataTableCell>{group.name}</DataTableCell>
                            <DataTableCell>{group.hostname}</DataTableCell>
                            <DataTableCell>{group.deployable ? <IconCheckmark16 /> : <></>}</DataTableCell>
                            <DataTableCell>
                                <Moment date={group.createdAt} fromNow />
                            </DataTableCell>
                            <DataTableCell>
                                <Moment date={group.updatedAt} fromNow />
                            </DataTableCell>
                            <DataTableCell>
                                <RemoveFromGroupButton group={group.name} userId={user.id} onComplete={refetch} />
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </TableBody>
            </DataTable>
        </div>
    )
}
