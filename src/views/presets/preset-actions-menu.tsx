import { IconDelete16 } from '@dhis2/ui'
import type { FC } from 'react'
import { ActionsMenu, useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'

/* What can be done to a preset besides loading it, on its row in the list and on its own page. */
export const PresetActionsMenu: FC<{ preset: Deployment; onDeleted: () => void }> = ({ preset, onDeleted }) => {
    const alert = useActionAlert()
    const [, deletePreset] = useAuthAxios({ url: `/deployments/${preset.id}`, method: 'DELETE' }, { manual: true, autoCancel: false })

    const remove = async () => {
        try {
            await deletePreset()
            alert.success(`Deleted preset "${preset.name}"`)
            onDeleted()
        } catch (error) {
            alert.error(`Could not delete the preset: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    return (
        <ActionsMenu
            label={`Actions for ${preset.name}`}
            items={[
                {
                    label: 'Delete',
                    icon: <IconDelete16 />,
                    destructive: true,
                    confirm: {
                        title: 'Delete preset',
                        message: (
                            <>
                                Delete the preset <strong>{preset.name}</strong> in <strong>{preset.groupName}</strong>?
                            </>
                        ),
                        confirmLabel: 'Delete',
                        destructive: true,
                    },
                    onClick: remove,
                },
            ]}
        />
    )
}
