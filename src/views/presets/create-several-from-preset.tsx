import { useEffect, useMemo } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios, useStacks, useUncopyable } from '../../hooks/index.ts'
import { useGroupedStackParameters } from '../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../types/index.ts'
import { BulkDeployModal } from '../instances/dhis2-v2/bulk-deploy-modal.tsx'
import { STACK_ID } from '../instances/dhis2-v2/dhis2-v2-form.tsx'
import { presetFormValues } from '../instances/dhis2-v2/preset-values.ts'
import { DEFAULT_TTL_SECONDS } from '../instances/fields/ttl-presets.ts'
import { askForUncopyable, withAsked } from './preset-payloads.ts'

/* Creates several instances from a preset without passing through the form. The list rows may be stale, so the preset is read again. */
export const CreateSeveralFromPreset: FC<{ preset: Deployment; onClose: () => void }> = ({ preset, onClose }) => {
    const navigate = useNavigate()
    const alert = useActionAlert()
    const { stacks } = useStacks()
    const [{ data: fresh, error }] = useAuthAxios<Deployment>(`/presets/${preset.id}`, { useCache: false })
    const { companions, stackDefaults, getIncludedParameters, loading: parametersLoading, error: parametersError } = useGroupedStackParameters(STACK_ID)
    const { bulkDeploy, activeStacks } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)
    const uncopyable = useUncopyable([STACK_ID, ...companions.map((companion) => companion.name)])

    useEffect(() => {
        const failed = error ?? parametersError
        if (failed) {
            alert.error(`Couldn't read ${preset.name}: ${failed.message}`)
            onClose()
        }
    }, [error, parametersError, alert, preset.name, onClose])

    /* Until the stacks are in, the payload would carry no parameters and the dialog wouldn't know what to ask for. */
    const values = useMemo(
        () => (fresh && !parametersLoading ? presetFormValues(fresh, { mainStackName: STACK_ID, initialValues: { ttl: DEFAULT_TTL_SECONDS, ...stackDefaults } }) : undefined),
        [fresh, parametersLoading, stackDefaults]
    )

    const askFor = useMemo(() => (values ? askForUncopyable({ values, activeStacks: activeStacks(values), uncopyable, stacks }) : []), [values, activeStacks, stacks, uncopyable])

    if (!values) {
        return null
    }

    return (
        <BulkDeployModal
            group={values.groupName}
            values={values}
            initialPrefix={fresh?.name ?? ''}
            copiedFrom={fresh?.name}
            askFor={askFor}
            onCancel={onClose}
            onDeploy={async (prefix, count, extra) => {
                const { deployments, error: deployError } = await bulkDeploy(withAsked(values, extra), prefix, count)
                if (deployError) {
                    return deployError
                }
                const created = deployments?.length ?? count
                alert.success(`Deploying ${created} ${created === 1 ? 'instance' : 'instances'}…`)
                onClose()
                navigate('/instances')
                return undefined
            }}
        />
    )
}
