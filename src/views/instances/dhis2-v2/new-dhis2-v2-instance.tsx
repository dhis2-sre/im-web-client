import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { KEEP_PRESET_VALUE, SensitiveFieldHintContext } from '../fields/sensitive-field-hint.ts'
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

    const { companions, stackDefaults, getIncludedParameters } = useGroupedStackParameters(STACK_ID)
    const creation = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)
    const { steps } = creation

    const [{ data: allPresets }, refetchPresets] = useAuthAxios<Deployment[]>('/presets', { autoCancel: false })
    const presets = useMemo(() => allPresets?.filter((preset) => preset.instances?.some((instance) => instance.stackName === STACK_ID)), [allPresets])
    const [sourcePreset, setSourcePreset] = useState<Deployment>()
    const { submit, bulk, openBulk, closeBulk, startBulk } = useNewInstanceSubmit(creation, sourcePreset, refetchPresets)

    const blankValues = useMemo(() => ({ ttl: DEFAULT_TTL_SECONDS, ...stackDefaults }), [stackDefaults])

    return (
        <Page parent={{ label: 'Instances', to: '/instances' }} title="New instance">
            <Form onSubmit={submit} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS }}>
                {({ handleSubmit, values, form }) => (
                    <div className={styles.form}>
                        <FillFromPreset
                            presets={presets}
                            mainStackName={STACK_ID}
                            initialPresetId={searchParams.get('preset') ?? undefined}
                            blankValues={blankValues}
                            onLoaded={setSourcePreset}
                        />
                        {/* Blank sensitive fields stand for the preset's values when creating from one. */}
                        <SensitiveFieldHintContext.Provider value={sourcePreset ? KEEP_PRESET_VALUE : undefined}>
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
                    </div>
                )}
            </Form>
            {bulk && <BulkDeployModal group={bulk.values.groupName} values={bulk.values} initialPrefix={bulk.values.name ?? ''} onCancel={closeBulk} onDeploy={startBulk} />}
        </Page>
    )
}
