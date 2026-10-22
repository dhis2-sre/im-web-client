import { Button } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { ListPage, OnlyMineFilter, useOnlyMine } from '../../components/index.ts'
import type { ListColumn } from '../../components/index.ts'
import { useAuthAxios, useDatabaseLabel } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'
import { PresetActionsMenu } from './preset-actions-menu.tsx'
import { presetMainInstance, presetSummary } from './preset-summary.ts'

const PresetDatabase: FC<{ preset: Deployment }> = ({ preset }) => <>{useDatabaseLabel(presetSummary(preset).databaseId).label}</>

const columns: ListColumn<Deployment>[] = [
    { key: 'name', label: 'Name', render: (preset) => preset.name, detail: (preset) => preset.description, sortValue: (preset) => preset.name },
    { key: 'group', label: 'Group', render: (preset) => preset.groupName, sortValue: (preset) => preset.groupName },
    { key: 'version', label: 'DHIS2 version', render: (preset) => presetSummary(preset).version, sortValue: (preset) => presetSummary(preset).version },
    { key: 'database', label: 'Database', render: (preset) => <PresetDatabase preset={preset} /> },
    { key: 'storage', label: 'Storage', render: (preset) => presetSummary(preset).storage },
    { key: 'companions', label: 'Companions', render: (preset) => presetSummary(preset).companions.join(', ') },
    { key: 'owner', label: 'Owner', render: (preset) => preset.user?.email, sortValue: (preset) => preset.user?.email ?? '' },
    { key: 'updated', label: 'Updated', render: (preset) => <Moment date={preset.updatedAt} fromNow />, sortValue: (preset) => preset.updatedAt },
]

const PresetRowActions: FC<{ preset: Deployment; onDeleted: () => void }> = ({ preset, onDeleted }) => {
    const navigate = useNavigate()

    return (
        <>
            <Button small secondary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
                Load
            </Button>
            <PresetActionsMenu preset={preset} onDeleted={onDeleted} />
        </>
    )
}

export const PresetsList: FC = () => {
    const [{ data: presets, loading, error }, refetch] = useAuthAxios<Deployment[]>('/deployments/presets', { useCache: false })
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyPresets')
    const shown = presets?.filter((preset) => isShown(preset.user))

    return (
        <ListPage
            title="Presets"
            count={shown?.length}
            filters={<OnlyMineFilter label="Show only my presets" checked={onlyMine} onChange={setOnlyMine} />}
            columns={columns}
            rows={shown}
            rowKey={(preset) => preset.id}
            rowHref={(preset) => `/presets/${preset.id}`}
            renderRowActions={(preset) => <PresetRowActions preset={preset} onDeleted={() => void refetch()} />}
            loading={loading}
            error={error ? { title: 'Could not fetch the presets', description: error.message } : undefined}
            empty={
                onlyMine && presets?.length
                    ? { title: 'None of the presets are yours', description: 'Turn off "Show only my presets" to see everyone\'s.' }
                    : { title: 'No presets yet', description: 'Save a preset from the arrow next to Create instance on the new instance form.' }
            }
        />
    )
}
