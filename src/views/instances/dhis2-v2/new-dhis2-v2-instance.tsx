import { Card } from '@dhis2/ui'
import { setIn } from 'final-form'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../../../components/index.ts'
import { COMPANION_LABELS } from '../../../constants.ts'
import { useAuthAxios, useStacks, useUncopyable } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { askForUncopyable, missingUncopyable } from '../../presets/preset-payloads.ts'
import { KeepValuePlaceholder } from '../fields/keep-value-placeholder.ts'
import { DEFAULT_TTL_SECONDS } from '../fields/ttl-presets.ts'
import styles from '../styles.module.css'
import { BulkDeployModal } from './bulk-deploy-modal.tsx'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'
import { PresetPicker } from './preset-picker.tsx'
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

    const blankValues = useMemo(() => ({ ttl: DEFAULT_TTL_SECONDS, presetChoice: 'none', [STACK_ID]: initialParameterValues }), [initialParameterValues])

    /* Names for the settings the Preset section lists as differing. A companion's switch is named after the companion when the stack gives it no name of its own. */
    const displayNames = useMemo(() => {
        const names: Record<string, string> = { public: 'Make public' }
        for (const stack of stacks.filter(({ name }) => name === STACK_ID || companions.some((companion) => companion.name === name))) {
            for (const { parameterName, displayName } of stack.parameters ?? []) {
                if (parameterName && displayName) {
                    names[`${stack.name}.${parameterName}`] = displayName
                }
            }
        }
        for (const { name, when } of companions) {
            if (when) {
                names[`${STACK_ID}.${when.parameter}`] ??= COMPANION_LABELS[name] ?? name
            }
        }
        return names
    }, [stacks, companions])

    /* Saving a new preset copies the form, which can't carry the preset's required logins, so they are asked for again. Creating from the preset carries them. */
    const validate = useCallback(
        (values: AnyObject) =>
            sourcePreset && values.presetChoice === 'new'
                ? Object.entries(missingUncopyable(values, uncopyable, activeStacks(values))).reduce((errors, [field, message]) => setIn(errors, field, message), {})
                : {},
        [sourcePreset, uncopyable, activeStacks]
    )

    const askFor = useMemo(
        () => (bulk ? askForUncopyable({ values: bulk.values, activeStacks: activeStacks(bulk.values), uncopyable, stacks }) : []),
        [bulk, activeStacks, uncopyable, stacks]
    )

    return (
        <Page parent={{ label: 'Instances', to: '/instances' }} title="New instance">
            <Card className={styles.container}>
                <Form onSubmit={submit} validate={validate} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS, presetChoice: 'none' }}>
                    {({ handleSubmit, values, form }) => (
                        <>
                            <PresetPicker
                                presets={presets}
                                mainStackName={STACK_ID}
                                initialPresetId={searchParams.get('preset') ?? undefined}
                                blankValues={blankValues}
                                onLoaded={setSourcePreset}
                            />
                            {/* Blank sensitive fields stand for the preset's values when creating from one. Saved as a new preset, a blank field gets the stack default instead. */}
                            <KeepValuePlaceholder.Provider value={sourcePreset && values.presetChoice !== 'new' ? "Leave blank to keep the preset's value" : undefined}>
                                <Dhis2V2Form
                                    handleCancel={navigateToInstanceList}
                                    handleSubmit={handleSubmit}
                                    name={values.name}
                                    steps={steps}
                                    mode="create"
                                    deployment={sourcePreset}
                                    footer={<PresetSection sourcePreset={sourcePreset} displayNames={displayNames} />}
                                    onCreateSeveral={() => openBulk(form)}
                                />
                            </KeepValuePlaceholder.Provider>
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
