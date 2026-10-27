import { Button } from '@dhis2/ui'
import type { FC } from 'react'
import { useMemo } from 'react'
import Moment from 'react-moment'
import { useNavigate, useParams } from 'react-router-dom'
import { KeyValueGrid, Page, Panel } from '../../components/index.ts'
import type { KeyValueItem, PageError } from '../../components/index.ts'
import { useAuthAxios, useStack } from '../../hooks/index.ts'
import type { Deployment, DeploymentInstance, StackWithParameterGroups } from '../../types/index.ts'
import { groupParametersByComponent } from '../../utils/component-parameters.ts'
import { ComponentParametersTable } from '../instances/details/component-parameters-table.tsx'
import { PresetDeleteButton } from './preset-delete-button.tsx'
import { presetMainInstance } from './preset-summary.ts'

const PresetInstance: FC<{ instance: DeploymentInstance }> = ({ instance }) => {
    const { stack } = useStack(instance.stackName ?? '')
    const { leftover } = useMemo(() => groupParametersByComponent(instance.parameters, stack as StackWithParameterGroups | undefined, []), [instance.parameters, stack])

    return (
        <Panel title={instance.stackName ?? 'Stack'} flush>
            <ComponentParametersTable parameters={leftover} />
        </Panel>
    )
}

const overviewItems = (preset: Deployment): KeyValueItem[] => [
    { label: 'Group', value: preset.groupName },
    { label: 'Owner', value: preset.user?.email },
    { label: 'Created', value: <Moment date={preset.createdAt} fromNow /> },
    { label: 'Updated', value: <Moment date={preset.updatedAt} fromNow /> },
    ...(preset.description ? [{ label: 'Description', value: preset.description }] : []),
]

const presetError = (preset: Deployment | undefined, error: Error | null): PageError | undefined => {
    if (error || !preset) {
        return { title: 'Could not fetch the preset', description: error?.message }
    }
    if (!preset.preset) {
        return { title: 'Not a preset', description: `${preset.name} is a deployment, not a preset.` }
    }
    return undefined
}

export const PresetDetails: FC = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [{ data: preset, loading, error }] = useAuthAxios<Deployment>(`/deployments/${id}`, { useCache: false })

    return (
        <Page
            parent={{ label: 'Presets', to: '/presets' }}
            title={preset?.preset ? preset.name : undefined}
            actions={
                preset?.preset && (
                    <>
                        <Button primary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
                            Load
                        </Button>
                        <PresetDeleteButton preset={preset} onDeleted={() => navigate('/presets')} />
                    </>
                )
            }
            loading={loading}
            error={loading ? undefined : presetError(preset, error)}
        >
            {preset && (
                <>
                    <Panel title="Overview">
                        <KeyValueGrid items={overviewItems(preset)} />
                    </Panel>
                    {preset.instances?.map((instance) => (
                        <PresetInstance key={instance.id} instance={instance} />
                    ))}
                </>
            )}
        </Page>
    )
}
