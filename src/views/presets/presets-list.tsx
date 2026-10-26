import { Button, Input } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { ListPage, OnlyMineFilter, useOnlyMine, useSavedSearchParams } from '../../components/index.ts'
import type { ListColumn } from '../../components/index.ts'
import { useAuthAxios, useDatabaseLabel } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'
import { presetMainInstance, presetSummary } from './preset-summary.ts'
import styles from './presets-list.module.css'

const PresetDatabase: FC<{ preset: Deployment }> = ({ preset }) => <>{useDatabaseLabel(presetSummary(preset).databaseId).label}</>

const columns: ListColumn<Deployment>[] = [
    { key: 'name', label: 'Name', render: (preset) => preset.name, detail: (preset) => preset.description, sortValue: (preset) => preset.name },
    { key: 'group', label: 'Group', render: (preset) => preset.groupName, sortValue: (preset) => preset.groupName, breakAnywhere: true },
    { key: 'version', label: 'DHIS2 version', render: (preset) => presetSummary(preset).version, sortValue: (preset) => presetSummary(preset).version, nowrap: true },
    { key: 'database', label: 'Database', render: (preset) => <PresetDatabase preset={preset} />, breakAnywhere: true },
    { key: 'storage', label: 'Storage', render: (preset) => presetSummary(preset).storage, nowrap: true },
    { key: 'companions', label: 'Companions', render: (preset) => presetSummary(preset).companions.join(', ') },
    { key: 'owner', label: 'Owner', render: (preset) => preset.user?.email, sortValue: (preset) => preset.user?.email ?? '', breakAnywhere: true },
    { key: 'updated', label: 'Updated', render: (preset) => <Moment date={preset.updatedAt} fromNow />, sortValue: (preset) => preset.updatedAt, nowrap: true },
]

const LoadButton: FC<{ preset: Deployment }> = ({ preset }) => {
    const navigate = useNavigate()

    return (
        <Button small secondary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
            Load
        </Button>
    )
}

export const PresetsList: FC = () => {
    const [{ data: presets, loading, error }] = useAuthAxios<Deployment[]>('/deployments/presets', { useCache: false })
    const { onlyMine, setOnlyMine, isShown } = useOnlyMine('showOnlyMyPresets')
    const { params, setParam } = useSavedSearchParams('presetFilters')
    const searchTerm = params.get('q') ?? ''
    const setSearchTerm = (value: string) => setParam('q', value)
    const term = searchTerm.trim().toLowerCase()
    const shown = presets?.filter(
        (preset) => isShown(preset.user) && (!term || [preset.name, preset.user?.email, preset.description].some((text) => text?.toLowerCase().includes(term)))
    )

    return (
        <ListPage
            title="Presets"
            filters={
                <>
                    {/* Input rather than InputField, which drops the accessible name. Its types lag the component and
                     * leave ariaLabel out, so it goes in by spread. */}
                    <Input
                        dense
                        {...{ ariaLabel: 'Search presets' }}
                        placeholder="Search name, owner or description…"
                        value={searchTerm}
                        onChange={({ value }) => setSearchTerm(value ?? '')}
                        className={styles.search}
                    />
                    <OnlyMineFilter checked={onlyMine} onChange={setOnlyMine} />
                </>
            }
            columns={columns}
            rows={shown}
            rowKey={(preset) => preset.id}
            rowHref={(preset) => `/presets/${preset.id}`}
            renderRowActions={(preset) => <LoadButton preset={preset} />}
            loading={loading}
            error={error ? { title: 'Could not fetch the presets', description: error.message } : undefined}
            empty={
                (onlyMine || term) && presets?.length
                    ? {
                          title: 'No matching presets',
                          action: (
                              <Button
                                  small
                                  secondary
                                  onClick={() => {
                                      setSearchTerm('')
                                      setOnlyMine(false)
                                  }}
                              >
                                  Clear filters
                              </Button>
                          ),
                      }
                    : { title: 'No presets', description: 'Presets are saved from the new instance form.' }
            }
        />
    )
}
