import { Button, ButtonStrip, Center, CircularLoader, DataTableToolbar, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import { useMemo } from 'react'
import Moment from 'react-moment'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useAuthAxios, useStack } from '../../hooks/index.ts'
import type { Deployment, DeploymentInstance, StackWithParameterGroups } from '../../types/index.ts'
import { groupParametersByComponent } from '../../utils/component-parameters.ts'
import { ComponentParametersTable } from '../instances/details/component-parameters-table.tsx'
import { DeletePresetButton } from './delete-preset-button.tsx'
import { presetMainInstance } from './preset-summary.ts'
import styles from './presets.module.css'

const PresetInstance: FC<{ instance: DeploymentInstance }> = ({ instance }) => {
    const { stack } = useStack(instance.stackName ?? '')
    const { leftover } = useMemo(() => groupParametersByComponent(instance.parameters, stack as StackWithParameterGroups | undefined, []), [instance.parameters, stack])

    return (
        <div className={styles.instance}>
            <DataTableToolbar className={styles.toolbar}>{instance.stackName}</DataTableToolbar>
            <ComponentParametersTable parameters={leftover} />
        </div>
    )
}

export const PresetDetails: FC = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [{ data: preset, loading, error }] = useAuthAxios<Deployment>(`/deployments/${id}`, { useCache: false })

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error || !preset) {
        return (
            <NoticeBox error title="Could not fetch the preset">
                {error?.message}
            </NoticeBox>
        )
    }

    if (!preset.preset) {
        return (
            <NoticeBox error title="Not a preset">
                {`${preset.name} is a deployment, not a preset.`}
            </NoticeBox>
        )
    }

    return (
        <div className={styles.wrapper}>
            <Heading title={preset.name ?? ''}>
                <ButtonStrip>
                    <Button primary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
                        Load
                    </Button>
                    <DeletePresetButton preset={preset} onDeleted={() => navigate('/presets')} />
                </ButtonStrip>
            </Heading>
            <dl className={styles.summary}>
                <dt>Group</dt>
                <dd>{preset.groupName}</dd>
                {preset.description && (
                    <>
                        <dt>Description</dt>
                        <dd>{preset.description}</dd>
                    </>
                )}
                <dt>Owner</dt>
                <dd>{preset.user?.email}</dd>
                <dt>Created</dt>
                <dd>
                    <Moment date={preset.createdAt} fromNow />
                </dd>
                <dt>Updated</dt>
                <dd>
                    <Moment date={preset.updatedAt} fromNow />
                </dd>
            </dl>
            {preset.instances?.map((instance) => <PresetInstance key={instance.id} instance={instance} />)}
        </div>
    )
}
