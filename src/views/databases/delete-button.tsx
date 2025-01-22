import { useAlert } from '@dhis2/app-service-alerts'
import i18n from '@dhis2/d2-i18n'
import { Center, CircularLoader, IconDelete16, MenuItem } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/index.ts'

type DeletButtonProps = {
    id: number
    databaseName: string
    groupName: string
    setOpen?: (id: number | null) => void
    onComplete: () => void
}

export const DeleteButton: FC<DeletButtonProps> = ({ id, databaseName, groupName, onComplete, setOpen }) => {
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
    }, [setShowConfirmationModal])

    const onCancel = useCallback(() => {
        setShowConfirmationModal(false)
        setOpen(null)
    }, [setShowConfirmationModal, setOpen])

    const onConfirm = useCallback(async () => {
        try {
            setShowConfirmationModal(false)
            await deleteDatabase()
            showAlert({ message: `Successfully deleted ${groupName}/${databaseName}`, isCritical: false })
            onComplete()
        } catch (error) {
            console.error(error)
            showAlert({ message: `There was an error when deleting ${groupName}/${databaseName}`, isCritical: true })
        }
    }, [deleteDatabase, setShowConfirmationModal, showAlert, groupName, databaseName, onComplete])

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    return (
        <>
            <MenuItem destructive dense label={i18n.t('Delete')} icon={<IconDelete16 />} onClick={onClick} />
            {showConfirmationModal && (
                <ConfirmationModal destructive onConfirm={onConfirm} onCancel={onCancel}>
                    Are you sure you wish to delete &quot;{groupName}/{databaseName}&quot;?
                </ConfirmationModal>
            )}
        </>
    )
}
