import { useAlert } from '@dhis2/app-service-alerts'
import { Button, IconDelete16 } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/index.ts'
import styles from './databases-list.module.css'

interface DeleteButtonProps {
    database: Database
    onComplete: () => void
}

export const DeleteButton: FC<DeleteButtonProps> = ({ database, onComplete }) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading }, deleteDatabase] = useAuthAxios<Database>(
        {
            url: `/databases/${database.id}`,
            method: 'delete',
        },
        { manual: true }
    )

    const onClick = useCallback(() => {
        setShowConfirmationModal(true)
    }, [setShowConfirmationModal])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
    }, [setShowConfirmationModal])

    const onConfirm = useCallback(async () => {
        try {
            setShowConfirmationModal(false)
            await deleteDatabase()
            showAlert({ message: `Successfully deleted database "${database.name}"`, isCritical: false })
            onComplete()
        } catch (error) {
            console.error(error)
            showAlert({ message: `There was an error when deleting database "${database.name}"`, isCritical: true })
        }
    }, [deleteDatabase, setShowConfirmationModal, showAlert, onComplete, database.name])

    const confirmationMessage = (
        <>
            Are you sure you wish to delete<br></br>
            <strong>{database.name}</strong>
            {database.groupName && (
                <>
                    <br />
                    from Group {database.groupName}
                </>
            )}
            ?
        </>
    )

    return (
        <>
            <Button loading={loading} icon={<IconDelete16 />} onClick={onClick} className={`${styles.iconButton} ${styles.danger}`} />
            {showConfirmationModal && (
                <ConfirmationModal destructive onConfirm={onConfirm} onCancel={onCancel}>
                    {confirmationMessage}
                </ConfirmationModal>
            )}
        </>
    )
}
