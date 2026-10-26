import { Button } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { FilterFields, GroupFilter, ListPage, OnlyMineFilter, SearchFilter, useOnlyMine, useSavedSearchParams } from '../../components/index.ts'
import type { ListColumn } from '../../components/index.ts'
import { useAuthAxios, useDatabaseLabel } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'
import { presetMainInstance, presetSummary } from './preset-summary.ts'

const PresetDatabase: FC<{ preset: Deployment }> = ({ preset }) => <>{useDatabaseLabel(presetSummary(preset).databaseId).label}</>

const columns: ListColumn<Deployment>[] = [
    { key: 'name', label: 'Name', render: (preset) => preset.name, detail: (preset) => preset.description, sortValue: (preset) => preset.name },
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
    const { params, setParams, setParam } = useSavedSearchParams('presetFilters')
    const searchTerm = params.get('q') ?? ''
    const group = params.get('group')
    const term = searchTerm.trim().toLowerCase()
    const clearFilters = () => {
        setParams(new URLSearchParams(), { replace: true })
        setOnlyMine(false)
    }

    const groupNames = [...new Set(presets?.map((preset) => preset.groupName))].sort()
    const shown = presets?.filter(
        (preset) =>
            isShown(preset.user) &&
            (!group || preset.groupName === group) &&
            (!term || [preset.name, preset.user?.email, preset.description].some((text) => text?.toLowerCase().includes(term)))
    )
    /* One section per group, as on the other lists, in the order of the group names. */
    const groups =
        presets &&
        groupNames.map((name) => ({ key: name, title: name, rows: shown?.filter((preset) => preset.groupName === name) ?? [] })).filter((section) => section.rows.length > 0)

    return (
        <ListPage
            title="Presets"
            filters={
                <>
                    <FilterFields>
                        <SearchFilter label="Search presets" value={searchTerm} onChange={(value) => setParam('q', value)} />
                        <GroupFilter groups={groupNames} selected={group} onChange={(value) => setParam('group', value ?? '')} />
                    </FilterFields>
                    <OnlyMineFilter checked={onlyMine} onChange={setOnlyMine} />
                </>
            }
            columns={columns}
            groups={groups}
            rowKey={(preset) => preset.id}
            rowHref={(preset) => `/presets/${preset.id}`}
            renderRowActions={(preset) => <LoadButton preset={preset} />}
            loading={loading}
            error={error ? { title: 'Could not fetch the presets', description: error.message } : undefined}
            empty={
                (onlyMine || term || group) && presets?.length
                    ? {
                          title: 'No matching presets',
                          action: (
                              <Button small secondary onClick={clearFilters}>
                                  Clear filters
                              </Button>
                          ),
                      }
                    : { title: 'No presets', description: 'Presets are saved from the new instance form.' }
            }
        />
    )
}
