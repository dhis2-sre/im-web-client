import { Button, IconDelete16 } from '@dhis2/ui'
import { useEffect } from 'react'
import { useAuthAxios } from '../hooks'

type DeleteInstanceProps = {
    instanceId: string
    onDelete?: () => void
}

const DeleteInstance: React.FC<DeleteInstanceProps> = ({ instanceId, onDelete }) => {
    const [{ loading, response }, deleteInstance] = useAuthAxios(
        {
            method: 'DELETE',
            url: `instances/${instanceId}`,
        },
        {
            manual: true,
        }
    )

    useEffect(() => {
        if (response?.status === 201 && onDelete) {
            onDelete()
        }
    }, [response, onDelete])

    return (
        <Button small secondary loading={loading} disabled={loading} icon={<IconDelete16 />} onClick={deleteInstance}>
            Delete
        </Button>
    )
}

export default DeleteInstance
