import { Button } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ActionsMenu, ItemPanel, ItemPanelList, MetaLine, MomentFromNow, Page, useActionAlert } from '../../components/index.ts'
import type { PageError } from '../../components/index.ts'
import { useAuthAxios, useDatabaseLabel, useStack } from '../../hooks/index.ts'
import type { Deployment, DeploymentInstance, StackWithParameterGroups } from '../../types/index.ts'
import { groupParametersByComponent } from '../../utils/component-parameters.ts'
import { ComponentParametersTable } from '../instances/details/component-parameters-table.tsx'
import { presetMainInstance, presetSummary } from './preset-summary.ts'

const PresetStack: FC<{ instance: DeploymentInstance }> = ({ instance }) => {
    const { stack } = useStack(instance.stackName ?? '')
    const { leftover } = useMemo(() => groupParametersByComponent(instance.parameters, stack as StackWithParameterGroups | undefined, []), [instance.parameters, stack])

    return (
        <ItemPanel title={instance.stackName ?? 'Stack'} meta={[`${leftover.length} parameters`]}>
            {leftover.length > 0 && <ComponentParametersTable parameters={leftover} />}
        </ItemPanel>
    )
}

/* The settings that tell presets apart come first, then where it lives and who owns it. */
const PresetFacts: FC<{ preset: Deployment }> = ({ preset }) => {
    const { version, databaseId, storage, companions } = presetSummary(preset)
    const { label: database } = useDatabaseLabel(databaseId)
    const items: ReactNode[] = [
        ...(version ? [`DHIS2 ${version}`] : []),
        ...(databaseId
            ? [
                  <>
                      Database: <Link to={`/databases/${databaseId}`}>{database}</Link>
                  </>,
              ]
            : []),
        ...(storage ? [`Storage: ${storage}`] : []),
        ...(companions.length > 0 ? [`With ${companions.join(', ')}`] : []),
        `Group: ${preset.groupName}`,
        ...(preset.user?.email ? [`Owned by ${preset.user.email}`] : []),
        <>
            Updated <MomentFromNow date={preset.updatedAt} />
        </>,
    ]

    return <MetaLine items={items} />
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
                            items={[
                                {
                                    label: 'Delete',
                                    button: true,
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
