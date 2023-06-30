import { Button, IconDelete16 } from '@dhis2/ui'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { deleteInstance } from '../api'
import { useAuthHeader } from 'react-auth-kit'
import {Instance} from "../types"

type DeleteInstanceProps = {
    instance: Instance
    onDelete?: () => void
}

const DeleteInstance: FC<DeleteInstanceProps> = (props) => {
    const [isSending, setIsSending] = useState(false)
    const isMounted = useRef(true)
    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    const getAuthHeader = useAuthHeader()
    const token = getAuthHeader()
    const { instance, onDelete } = props

    const deleteInstanceRequest = useCallback(async () => {
        if (!window.confirm(`Are you sure you wish to delete "${instance.groupName}/${instance.name}"?`)) {
            return
        }
        try {
            setIsSending(true)
            await deleteInstance(token, instance.id)
            onDelete?.()
        } catch (err) {
            console.error(err)
        } finally {
            setIsSending(false)
        }
    }, [token, instance, onDelete])

    return (
        <Button small secondary loading={isSending} disabled={isSending} icon={<IconDelete16 />} onClick={deleteInstanceRequest}>
            Delete
        </Button>
    )
}

export default DeleteInstance
