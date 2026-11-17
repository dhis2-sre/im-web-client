import { Card } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../../../components/index.ts'
import { useAuthAxios, useStacks, useUncopyable } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { askForUncopyable } from '../../presets/preset-payloads.ts'
import { keepPresetValue, SensitiveFieldHintContext } from '../fields/sensitive-field-hint.ts'
import { DEFAULT_TTL_SECONDS } from '../fields/ttl-presets.ts'
import styles from '../styles.module.css'
import { BulkDeployModal } from './bulk-deploy-modal.tsx'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'
import { FillFromPreset } from './preset-picker.tsx'
import { PresetSection } from './preset-section.tsx'
import { useNewInstanceSubmit } from './use-new-instance-submit.ts'

export const NewDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const navigateToInstanceList = useCallback(() => {
        navigate('/instances')
    }, [navigate])

    const { stacks } = useStacks()
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
    const creation = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)
    const { activeStacks, steps } = creation
    const uncopyable = useUncopyable([STACK_ID, ...companions.map((companion) => companion.name)])

    const [{ data: allPresets }, refetchPresets] = useAuthAxios<Deployment[]>('/presets', { autoCancel: false })
    const presets = useMemo(() => (allPresets ?? []).filter((preset) => preset.instances?.some((instance) => instance.stackName === STACK_ID)), [allPresets])
    const [sourcePreset, setSourcePreset] = useState<Deployment>()
    const { submit, bulk, openBulk, closeBulk, startBulk } = useNewInstanceSubmit(creation, sourcePreset, refetchPresets)

    const blankValues = useMemo(() => ({ ttl: DEFAULT_TTL_SECONDS, [STACK_ID]: initialParameterValues }), [initialParameterValues])

    const sensitiveHint = useMemo(() => (sourcePreset ? keepPresetValue(sourcePreset.name) : undefined), [sourcePreset])

    const askFor = useMemo(
        () => (bulk ? askForUncopyable({ values: bulk.values, activeStacks: activeStacks(bulk.values), uncopyable, stacks }) : []),
        [bulk, activeStacks, uncopyable, stacks]
    )

    return (
        <Page parent={{ label: 'Instances', to: '/instances' }} title="New instance">
            <Card className={styles.container}>
                <Form onSubmit={submit} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS }}>
                    {({ handleSubmit, values, form }) => (
                        <>
                            <FillFromPreset
                                presets={presets}
                                mainStackName={STACK_ID}
                                initialPresetId={searchParams.get('preset') ?? undefined}
                                blankValues={blankValues}
                                onLoaded={setSourcePreset}
                            />
                            {/* Blank sensitive fields stand for the preset's values when creating from one. */}
                            <SensitiveFieldHintContext.Provider value={sensitiveHint}>
                                <Dhis2V2Form
                                    handleCancel={navigateToInstanceList}
                                    handleSubmit={handleSubmit}
                                    name={values.name}
                                    steps={steps}
                                    mode="create"
                                    deployment={sourcePreset}
                                    footer={sourcePreset ? undefined : <PresetSection />}
                                    onCreateSeveral={() => openBulk(form)}
                                />
                            </SensitiveFieldHintContext.Provider>
                        </>
                    )}
                </Form>
            </Card>
            {bulk && (
                <BulkDeployModal
                    group={bulk.values.groupName}
                    values={bulk.values}
                    initialPrefix={bulk.values.name ?? ''}
                    copiedFrom={sourcePreset?.name}
                    askFor={askFor}
                    onCancel={closeBulk}
                    onDeploy={startBulk}
                />
            )}
        </Page>
    )
}
