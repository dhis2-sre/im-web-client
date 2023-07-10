import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { useAuthAxios } from '../../hooks'
import { GroupWithDatabases } from '../../types'
import { ConfirmationModal } from '../ConfirmationModal'
import { useAlert } from '@dhis2/app-service-alerts'

type DeletButtonProps = {
    id: number
    databaseName: string
    groupName: string
    onDeleteComplete: Function
}

export const DeleteButton = ({ id, databaseName, groupName, onDeleteComplete }: DeletButtonProps) => {
    const [isPromptShowing, setIsPromptShowing] = useState(false)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ response, loading, error }, deleteDatabase] = useAuthAxios<GroupWithDatabases>(
        {
            url: `databases/${id}`,
            method: 'delete',
        },
        { manual: true }
    )

    const onClick = useCallback(() => {
        setIsPromptShowing(true)
    }, [setIsPromptShowing])

    const onCancel = useCallback(() => {
        setIsPromptShowing(false)
    }, [setIsPromptShowing])

    const onConfirm = useCallback(() => {
        if (!loading) {
            deleteDatabase()
            setIsPromptShowing(false)
        }
    }, [deleteDatabase, setIsPromptShowing, loading])

    useEffect(() => {
        if (response.status === 202 && !loading) {
            showAlert({ message: `Successfully deleted ${groupName}/${databaseName}`, isCritical: false })
            onDeleteComplete()
        }
    }, [onDeleteComplete, response, showAlert, groupName, databaseName, loading])

    useEffect(() => {
        if (error && !loading) {
            showAlert({ message: `There was an error when deleting ${groupName}/${databaseName}`, isCritical: true })
        }
    }, [error, showAlert, groupName, databaseName, loading])

    return (
        <>
            <Button small destructive loading={loading} icon={<IconDelete16 />} onClick={onClick}>
                Delete
            </Button>
            {isPromptShowing && (
                <ConfirmationModal destructive onConfirm={onConfirm} onCancel={onCancel}>
                    Are you sure you wish to delete "{groupName}/{databaseName}"?
                </ConfirmationModal>
            )}
        </>
    )
}
