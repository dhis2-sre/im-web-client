import { useAlert } from '@dhis2/app-service-alerts'
import { Button } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { ConfirmationModal } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'

const CRITICAL_OPTIONS = { critical: true }

export const DeletePresetButton: FC<{ preset: Deployment; onDeleted: () => void; small?: boolean }> = ({ preset, onDeleted, small }) => {
    const [confirming, setConfirming] = useState(false)
    const { show: showError } = useAlert(({ message }) => message, CRITICAL_OPTIONS)
    const [{ loading }, deletePreset] = useAuthAxios({ url: `/deployments/${preset.id}`, method: 'DELETE' }, { manual: true, autoCancel: false })

    const remove = async () => {
        setConfirming(false)
        try {
            await deletePreset()
            onDeleted()
        } catch (error) {
            showError({ message: `Could not delete the preset: ${error instanceof Error ? error.message : error}` })
        }
    }

    return (
        <>
            <Button small={small} destructive secondary loading={loading} onClick={() => setConfirming(true)}>
                Delete
            </Button>
            {confirming && (
                <ConfirmationModal destructive onConfirm={() => void remove()} onCancel={() => setConfirming(false)}>
                    Delete the preset <strong>{preset.name}</strong> in <strong>{preset.groupName}</strong>?
                </ConfirmationModal>
            )}
        </>
    )
}
