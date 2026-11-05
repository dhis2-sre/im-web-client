import { Button, IconApps16, IconClockHistory16, IconFolder16, IconUser16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ActionsMenu, ItemPanel, ItemPanelList, MetaFact, MetaLine, MomentFromNow, Page, useActionAlert } from '../../components/index.ts'
import type { PageError } from '../../components/index.ts'
import { useAuthAxios, useStack } from '../../hooks/index.ts'
import type { Deployment, DeploymentInstance, StackWithParameterGroups } from '../../types/index.ts'
import { groupParametersByComponent } from '../../utils/component-parameters.ts'
import { ComponentParametersTable } from '../instances/details/component-parameters-table.tsx'
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
    const alert = useActionAlert()
    const [{ data: preset, loading, error }] = useAuthAxios<Deployment>(`/deployments/${id}`, { useCache: false })
    const [, deletePreset] = useAuthAxios({ url: `/deployments/${id}`, method: 'DELETE' }, { manual: true, autoCancel: false })

    const remove = async (preset: Deployment) => {
        try {
            await deletePreset()
            alert.success(`Deleted ${preset.name}`)
            navigate('/presets')
        } catch (error) {
            alert.error(`Couldn't delete ${preset.name}: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    return (
        <Page
            parent={{ label: 'Presets', to: '/presets' }}
            title={preset?.preset ? preset.name : undefined}
            description={preset?.preset ? preset.description || undefined : undefined}
            band
            actions={
                preset?.preset && (
                    <>
                        <Button small primary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
                            Load
                        </Button>
                        <ActionsMenu
                            label={`Actions for ${preset.name}`}
                            buttons
                            items={[
                                {
                                    label: 'Delete',
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
                                    onClick: () => remove(preset),
                                },
                            ]}
                        />
                    </>
                )
            }
            loading={loading}
            error={loading ? undefined : presetError(preset, error)}
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
