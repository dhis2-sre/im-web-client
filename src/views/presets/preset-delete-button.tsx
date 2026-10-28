import { Button } from '@dhis2/ui'
import type { FC } from 'react'
import { useActionAlert, useConfirmedAction } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'

/* Deleting is done from the preset's own page rather than from every row of the list. */
export const PresetDeleteButton: FC<{ preset: Deployment; onDeleted: () => void }> = ({ preset, onDeleted }) => {
    const alert = useActionAlert()
    const { confirm, modal } = useConfirmedAction()
    const [{ loading }, deletePreset] = useAuthAxios({ url: `/deployments/${preset.id}`, method: 'DELETE' }, { manual: true, autoCancel: false })

    const remove = async () => {
        try {
            await deletePreset()
            alert.success(`Deleted ${preset.name}`)
            onDeleted()
        } catch (error) {
            alert.error(`Couldn't delete ${preset.name}: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    return (
        <>
            <Button
                destructive
                loading={loading}
                onClick={() =>
                    confirm(
                        {
                            title: 'Delete preset',
                            message: (
                                <>
                                    Delete the preset <strong>{preset.name}</strong> in <strong>{preset.groupName}</strong>?
                                </>
                            ),
                            confirmLabel: 'Delete',
                            destructive: true,
                        },
                        () => void remove()
                    )
                }
            >
                Delete
            </Button>
            {modal}
        </>
    )
}
