import { useEffect, useMemo } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { useGroupedStackParameters } from '../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../types/index.ts'
import { BulkDeployModal } from '../instances/dhis2-v2/bulk-deploy-modal.tsx'
import { STACK_ID } from '../instances/dhis2-v2/dhis2-v2-form.tsx'
import { presetFormValues } from '../instances/dhis2-v2/preset-values.ts'
import { DEFAULT_TTL_SECONDS } from '../instances/fields/ttl-presets.ts'

/* Creates several instances from a preset without passing through the form. The list rows may be stale, so the preset is read again. */
export const CreateSeveralFromPreset: FC<{ preset: Deployment; onClose: () => void }> = ({ preset, onClose }) => {
    const navigate = useNavigate()
    const alert = useActionAlert()
    const [{ data: fresh, error }] = useAuthAxios<Deployment>(`/presets/${preset.id}`, { useCache: false })
    const { companions, stackDefaults, getIncludedParameters, loading: parametersLoading, error: parametersError } = useGroupedStackParameters(STACK_ID)
    const { bulkDeploy } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)

    useEffect(() => {
        const failed = error ?? parametersError
        if (failed) {
            alert.error(`Couldn't read ${preset.name}: ${failed.message}`)
            onClose()
        }
    }, [error, parametersError, alert, preset.name, onClose])

    /* Until the stacks are in, the resource totals would be missing. */
    const values = useMemo(
        () => (fresh && !parametersLoading ? presetFormValues(fresh, { mainStackName: STACK_ID, initialValues: { ttl: DEFAULT_TTL_SECONDS, ...stackDefaults } }) : undefined),
        [fresh, parametersLoading, stackDefaults]
    )

    if (!values) {
        return null
    }

    return (
        <BulkDeployModal
            group={values.groupName}
            values={values}
            initialPrefix={fresh?.name ?? ''}
            onCancel={onClose}
            onDeploy={async (prefix, count) => {
                const { deployments, error: deployError } = await bulkDeploy(values, { prefix, count, fromPreset: { id: Number(preset.id), dirtyFields: {} } })
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
