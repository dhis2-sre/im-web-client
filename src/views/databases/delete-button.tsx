import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import { IconDelete16, MenuItem } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/index.ts'

type DeleteButtonProps = {
    id: number
    databaseName: string
    groupName: string
    togglePopover: () => void
    onComplete: () => void
}

export const DeleteButton: FC<DeleteButtonProps> = ({ id, databaseName, groupName, onComplete, togglePopover }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteDatabase] = useAuthAxios<Database>(
        {
            url: `/databases/${id}`,
            method: 'delete',
        },
        { manual: true }
    )

    const onClick = useCallback(() => {
        setShowConfirmationModal(true)
    }, [])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
        togglePopover()
    }, [togglePopover])

    const onConfirm = useCallback(async () => {
        try {
            setShowConfirmationModal(false)
            await deleteDatabase()
            showAlert({ message: `Successfully deleted ${groupName}/${databaseName}`, isCritical: false })
            onComplete()
            togglePopover()
        } catch (error) {
            console.error('Error deleting database:', error)
            showAlert({ message: `There was an error when deleting ${groupName}/${databaseName}`, isCritical: true })
            togglePopover()
        }
    }, [deleteDatabase, togglePopover, showAlert, groupName, databaseName, onComplete])

    if (loading) {
        return <p style={{ marginLeft: '10px', color: 'gray' }}>Loading ...</p>
    }

    return (
        <>
            <MenuItem destructive dense label={i18n.t('Delete')} icon={<IconDelete16 />} onClick={onClick} disabled={loading} />
            {showConfirmationModal && (
                <ConfirmationModal destructive onConfirm={onConfirm} onCancel={onCancel}>
                    {i18n.t(`Are you sure you wish to delete "${groupName}/${databaseName}"?`, {
                        groupName,
                        databaseName,
                    })}
                </ConfirmationModal>
            )}
        </>
    )
}
