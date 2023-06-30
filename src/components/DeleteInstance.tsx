import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteInstance } from '../api'
import { useAuthHeader } from 'react-auth-kit'

type DeleteInstanceProps = {
    instanceId: number
    onDelete?: () => void
}

const DeleteInstance: React.FC<DeleteInstanceProps> = (props) => {
    const [isSending, setIsSending] = useState(false)
    const isMounted = useRef(true)
    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    const getAuthHeader = useAuthHeader()
    const token = getAuthHeader()
    const { instanceId, onDelete } = props

    const deleteInstanceRequest = useCallback(async () => {
        try {
            setIsSending(true)
            await deleteInstance(token, instanceId)
            onDelete?.()
        } catch (err) {
            console.error(err)
        } finally {
            setIsSending(false)
        }
    }, [token, instanceId, onDelete])

    return (
        <Button small secondary loading={isSending} disabled={isSending} icon={<IconDelete16 />} onClick={deleteInstanceRequest}>
            Delete
        </Button>
    )
}

export default DeleteInstance
