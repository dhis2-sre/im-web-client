import { useAlert } from '@dhis2/app-service-alerts'
import { Card } from '@dhis2/ui'
import type { AnyObject, FormApi } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { DEFAULT_TTL_SECONDS } from '../fields/ttl-presets.ts'
import styles from '../styles.module.css'
import { BulkDeployModal } from './bulk-deploy-modal.tsx'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'
import { PresetPicker } from './preset-picker.tsx'

const SUCCESS_OPTIONS = { success: true }
const PRESETS_ENABLED = true

export const NewDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const navigateToInstanceList = useCallback(() => {
        navigate('/instances')
    }, [navigate])

    const { groups, companions } = useGroupedStackParameters(STACK_ID)
    const getIncludedParameters = useCallback(
        (values: AnyObject) => {
            const stackValues: AnyObject = values[STACK_ID] ?? {}
            return groups
                .filter(({ group }) => !group.when || stackValues[group.when.parameter] === group.when.equals)
                .flatMap(({ parameters }) => parameters.map((parameter) => parameter.parameterName ?? ''))
        },
        [groups]
    )
    const { createDeployment, bulkDeploy, steps } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)

    const [{ data: allPresets }, refetchPresets] = useAuthAxios<Deployment[]>('/deployments/presets', { autoCancel: false, manual: !PRESETS_ENABLED })
    const presets = useMemo(() => (allPresets ?? []).filter((preset) => preset.instances?.some((instance) => instance.stackName === STACK_ID)), [allPresets])

    const [bulkValues, setBulkValues] = useState<AnyObject>()
    const { show: showBulkStarted } = useAlert(({ count }) => `Deploying ${count} ${count === 1 ? 'instance' : 'instances'}…`, SUCCESS_OPTIONS)

    /* The name isn't used by a bulk deploy, which names the deployments from a prefix, so its errors don't stop one. Any other error is shown by submitting, which final-form refuses while there are errors. */
    const openBulkDeploy = useCallback((form: FormApi) => {
        const { values, errors = {} } = form.getState()
        if (Object.keys(errors).some((field) => field !== 'name')) {
            void form.submit()
            return
        }
        setBulkValues(values)
    }, [])

    const startBulkDeploy = useCallback(
        async (prefix: string, count: number) => {
            if (!bulkValues) {
                return undefined
            }
            const { deployments, error } = await bulkDeploy(bulkValues, prefix, count)
            if (error) {
                return error
            }
            showBulkStarted({ count: deployments?.length ?? count })
            navigate('/instances')
            return undefined
        },
        [bulkValues, bulkDeploy, showBulkStarted, navigate]
    )

    return (
        <Page parent={{ label: 'Instances', to: '/instances' }} title="New instance">
            <Card className={styles.container}>
                <Form onSubmit={createDeployment} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS }}>
                    {({ handleSubmit, values, form }) => (
                        <>
                            {PRESETS_ENABLED && (
                                <PresetPicker presets={presets} mainStackName={STACK_ID} onDeleted={refetchPresets} initialPresetId={searchParams.get('preset') ?? undefined} />
                            )}
                            <Dhis2V2Form
                                handleCancel={navigateToInstanceList}
                                handleSubmit={handleSubmit}
                                name={values.name}
                                steps={steps}
                                mode="create"
                                onCreateSeveral={() => openBulkDeploy(form)}
                            />
                        </>
                    )}
                </Form>
            </Card>
            {bulkValues && (
                <BulkDeployModal
                    group={bulkValues.groupName}
                    values={bulkValues}
                    initialPrefix={bulkValues.name ?? ''}
                    onCancel={() => setBulkValues(undefined)}
                    onDeploy={startBulkDeploy}
                />
            )}
        </Page>
    )
}
