import { useAlert } from '@dhis2/app-service-alerts'
import { Card } from '@dhis2/ui'
import type { AnyObject, FormApi } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { DEFAULT_TTL_SECONDS } from '../fields/ttl-presets.ts'
import styles from '../styles.module.css'
import { Dhis2V2Form, STACK_ID } from './dhis2-v2-form.tsx'
import { PresetPicker } from './preset-picker.tsx'

const SUCCESS_OPTIONS = { success: true }
const PRESETS_ENABLED = false

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

    /* Both buttons submit the same form, so it is validated the same way either way; this records which one was pressed. */
    const savingPreset = useRef(false)
    const [nameCheckKey, setNameCheckKey] = useState(0)

    const submit = useCallback(
        async (values: AnyObject, form: FormApi) => {
            if (!savingPreset.current) {
                return createDeployment(values)
            }

            const errors = await savePreset(values)
            if (errors) {
                return errors
            }

            /* The name now belongs to the preset, so it is cleared and the availability check that called it free is remounted. */
            showSaved({ name: values.name })
            form.change('name', undefined)
            setNameCheckKey((key) => key + 1)
            void refetchPresets()
            return undefined
        },
        [createDeployment, savePreset, showSaved, refetchPresets]
    )

    return (
        <>
            <Heading title="Create a new DHIS2 Instance (v2)" />
            <Card className={styles.container}>
                <Form onSubmit={submit} keepDirtyOnReinitialize initialValues={{ ttl: DEFAULT_TTL_SECONDS }}>
                    {({ handleSubmit, values, form }) => (
                        <>
                            {PRESETS_ENABLED && <PresetPicker presets={presets} mainStackName={STACK_ID} onDeleted={refetchPresets} />}
                            <Dhis2V2Form
                                handleCancel={navigateToInstanceList}
                                handleSubmit={handleSubmit}
                                name={values.name}
                                steps={steps}
                                nameCheckKey={nameCheckKey}
                                onSavePreset={
                                    PRESETS_ENABLED
                                        ? () => {
                                              savingPreset.current = true
                                              void Promise.resolve(form.submit()).finally(() => {
                                                  savingPreset.current = false
                                              })
                                          }
                                        : undefined
                                }
                            />
                        </>
                    )}
                </Form>
            </Card>
        </>
    )
}
