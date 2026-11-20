import { Button, IconApps16, IconClockHistory16, IconFolder16, IconUser16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ItemPanel, ItemPanelList, MetaFact, MetaLine, MomentFromNow, Page } from '../../components/index.ts'
import { useAuthAxios, useStack } from '../../hooks/index.ts'
import type { Deployment, DeploymentInstance, StackWithParameterGroups } from '../../types/index.ts'
import { groupParametersByComponent } from '../../utils/component-parameters.ts'
import { ComponentParametersTable } from '../instances/details/component-parameters-table.tsx'
import { PresetActions } from './preset-actions.tsx'
import { presetMainInstance, presetSummary } from './preset-summary.ts'

const PresetStack: FC<{ instance: DeploymentInstance }> = ({ instance }) => {
    const { stack } = useStack(instance.stackName ?? '')
    const { leftover } = useMemo(() => groupParametersByComponent(instance.parameters, stack as StackWithParameterGroups | undefined, []), [instance.parameters, stack])

    return <ItemPanel title={instance.stackName ?? 'Stack'}>{leftover.length > 0 && <ComponentParametersTable parameters={leftover} />}</ItemPanel>
}

/* Who owns it, when it last changed and where it lives, in the instance page's order, then the
 * stacks it deploys beside DHIS2. */
const PresetFacts: FC<{ preset: Deployment }> = ({ preset }) => {
    const { companions } = presetSummary(preset)
    return (
        <MetaLine
            items={{
                owner: preset.user?.email && <MetaFact icon={<IconUser16 />}>Owned by {preset.user.email}</MetaFact>,
                updated: (
                    <MetaFact icon={<IconClockHistory16 />}>
                        Updated <MomentFromNow date={preset.updatedAt} />
                    </MetaFact>
                ),
                group: <MetaFact icon={<IconFolder16 />}>{preset.groupName}</MetaFact>,
                companions: companions.length > 0 && <MetaFact icon={<IconApps16 />}>With {companions.join(', ')}</MetaFact>,
            }}
        />
    )
}

export const PresetDetails: FC = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [{ data: preset, loading, error }] = useAuthAxios<Deployment>(`/presets/${id}`, { useCache: false })

    return (
        <Page
            parent={{ label: 'Presets', to: '/presets' }}
            title={preset?.name}
            description={preset?.description || undefined}
            band
            actions={
                preset && (
                    <>
                        <Button small primary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
                            Create instance
                        </Button>
                        <PresetActions preset={preset} buttons onDeleted={() => navigate('/presets')} />
                    </>
                )
            }
            loading={loading}
            error={loading || (preset && !error) ? undefined : { title: "Couldn't load the preset", description: error?.message }}
            summary={preset && <PresetFacts preset={preset} />}
        >
            {preset && (
                <ItemPanelList title="Stacks">
                    {preset.instances?.map((instance) => (
                        <PresetStack key={instance.id} instance={instance} />
                    ))}
                </ItemPanelList>
            )}
        </Page>
    )
}
