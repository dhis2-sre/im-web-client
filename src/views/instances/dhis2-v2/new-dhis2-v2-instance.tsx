import { useAlert } from '@dhis2/app-service-alerts'
import { Card } from '@dhis2/ui'
import { FORM_ERROR } from 'final-form'
import type { AnyObject, FormApi } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { DEFAULT_TTL_SECONDS } from '../fields/ttl-presets.ts'
import { validateDnsLabel } from '../fields/validate-dns-label.ts'
import styles from '../styles.module.css'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'
import { PresetPicker } from './preset-picker.tsx'

const SUCCESS_OPTIONS = { success: true }
const CRITICAL_OPTIONS = { critical: true }
const PRESETS_ENABLED = true

export const NewDhis2V2Instance: FC = () => {
    const navigate = useNavigate()
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
    const { createDeployment, savePreset, steps } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)

    const [{ data: allPresets }, refetchPresets] = useAuthAxios<Deployment[]>('/deployments/presets', { autoCancel: false, manual: !PRESETS_ENABLED })
    const presets = useMemo(() => (allPresets ?? []).filter((preset) => preset.instances?.some((instance) => instance.stackName === STACK_ID)), [allPresets])
    const { show: showSaved } = useAlert(({ name }) => `Saved preset ${name}`, SUCCESS_OPTIONS)

    const { show: showSaveFailed } = useAlert(({ message }) => message, CRITICAL_OPTIONS)
    const savingPreset = useRef(false)

    /* A preset may share its name with a deployment, so the name field's availability error, which is about deployments, is the one error that doesn't stop it; the backend refuses a name another preset has. */
    const saveAsPreset = useCallback(
        async (form: FormApi) => {
            if (savingPreset.current) {
                return
            }
            const { values, errors = {} } = form.getState()
            if (Object.keys(errors).some((field) => field !== 'name') || validateDnsLabel(values.name ?? '')) {
                void form.submit()
                return
            }

            savingPreset.current = true
            const result = await savePreset(values).finally(() => {
                savingPreset.current = false
            })
            if (result) {
                showSaveFailed({ message: result[FORM_ERROR] ?? 'Could not save the preset' })
                return
            }

            showSaved({ name: values.name })
            void refetchPresets()
        },
        [savePreset, showSaved, showSaveFailed, refetchPresets]
    )

    return (
        <>
            <Heading title="Create a new DHIS2 Instance (v2)" />
            <Card className={styles.container}>
                <Form onSubmit={createDeployment} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS }}>
                    {({ handleSubmit, values, form }) => (
                        <>
                            {PRESETS_ENABLED && <PresetPicker presets={presets} mainStackName={STACK_ID} onDeleted={refetchPresets} />}
                            <Dhis2V2Form
                                handleCancel={navigateToInstanceList}
                                handleSubmit={handleSubmit}
                                name={values.name}
                                steps={steps}
                                onSavePreset={PRESETS_ENABLED ? () => void saveAsPreset(form) : undefined}
                            />
                        </>
                    )}
                </Form>
            </Card>
        </>
    )
}
