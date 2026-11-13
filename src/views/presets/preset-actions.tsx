import { useState } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionsMenu, useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'
import { CreateSeveralFromPreset } from './create-several-from-preset.tsx'
import { presetMainInstance } from './preset-summary.ts'

type PresetActionsProps = {
    preset: Deployment
    /* Every action as a button instead of a menu, as on the preset page. */
    buttons?: boolean
    onDeleted: () => void
}

/* Everything that can be done to a preset as a whole, on its row in the list and on its own page. */
export const PresetActions: FC<PresetActionsProps> = ({ preset, buttons, onDeleted }) => {
    const navigate = useNavigate()
    const [creatingSeveral, setCreatingSeveral] = useState(false)
    const alert = useActionAlert()
    const [, executeDelete] = useAuthAxios({ method: 'DELETE', url: `/presets/${preset.id}` }, { manual: true, autoCancel: false })

    const remove = async () => {
        try {
            await executeDelete()
            alert.success(`Deleted ${preset.name}`)
            onDeleted()
        } catch (error) {
            alert.error(`Couldn't delete ${preset.name}: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    return (
        <>
            <ActionsMenu
                label={`Actions for ${preset.name}`}
                buttons={buttons}
                items={[
                    {
                        label: 'Create several instances…',
                        unavailable: presetMainInstance(preset) ? undefined : 'This preset has no DHIS2 instance',
                        onClick: () => setCreatingSeveral(true),
                    },
                    { label: 'Edit', onClick: () => navigate(`/presets/${preset.id}/edit`) },
                    { label: 'Duplicate', onClick: () => navigate(`/presets/new?from=${preset.id}`) },
                    {
                        label: 'Delete',
                        destructive: true,
                        confirm: {
                            title: `Delete ${preset.name}?`,
                            message: (
                                <>
                                    Deletes the preset from <strong>{preset.groupName}</strong>. Instances created from it keep running. This can&apos;t be undone.
                                </>
                            ),
                            confirmLabel: 'Delete preset',
                            destructive: true,
                        },
                        onClick: remove,
                    },
                ]}
            />
            {creatingSeveral && <CreateSeveralFromPreset preset={preset} onClose={() => setCreatingSeveral(false)} />}
        </>
    )
}
