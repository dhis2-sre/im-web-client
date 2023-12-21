import { Center, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useParams } from 'react-router-dom'
import { useAuthAxios } from '../../hooks'
import { User } from '../../types'
import { AddToGroupButton } from './add-to-group-button'
import { RemoveFromGroupButton } from './remove-from-group-button'
import { Heading } from '../../components'

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
            <Heading title={user.email} />
            <div>
                Groups <AddToGroupButton onComplete={refetch} userId={user.id} />
            </div>
            <ul>
                {user.groups?.map((group) => {
                    return (
                        <li key={group.name}>
                            {group.name} <RemoveFromGroupButton group={group.name} userId={user.id} onComplete={refetch} />
                        </li>
                    )
                })}
            </ul>
            <div>Administrator groups</div>
            <ul>
                {user.adminGroups?.map((group) => {
                    return <li key={group.name}>{group.name}</li>
                })}
            </ul>
        </div>
    )
}
