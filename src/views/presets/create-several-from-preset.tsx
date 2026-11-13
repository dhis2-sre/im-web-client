import type { AnyObject } from 'final-form'
import { useCallback, useEffect, useMemo } from 'react'
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
    const { groups, companions, initialParameterValues } = useGroupedStackParameters(STACK_ID)
    const getIncludedParameters = useCallback(
        (values: AnyObject) => {
            const stackValues: AnyObject = values[STACK_ID] ?? {}
            return groups
                .filter(({ group }) => !group.when || stackValues[group.when.parameter] === group.when.equals)
                .flatMap(({ parameters }) => parameters.map((parameter) => parameter.parameterName ?? ''))
        },
        [groups]
    )
    const { bulkDeploy, activeStacks } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)
    const uncopyable = useUncopyable([STACK_ID, ...companions.map((companion) => companion.name)])

    useEffect(() => {
        if (error) {
            alert.error(`Couldn't read ${preset.name}: ${error.message}`)
            onClose()
        }
    }, [error, alert, preset.name, onClose])

    const values = useMemo(() => fresh && presetFormValues(fresh, STACK_ID, { ttl: DEFAULT_TTL_SECONDS, [STACK_ID]: initialParameterValues }), [fresh, initialParameterValues])

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
