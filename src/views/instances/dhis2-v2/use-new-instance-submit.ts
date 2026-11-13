import { FORM_ERROR } from 'final-form'
import type { AnyObject, FormApi } from 'final-form'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActionAlert } from '../../../components/index.ts'
import type { useStackDeploymentCreation } from '../../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../../types/index.ts'
import { changedFromPreset, withAsked } from '../../presets/preset-payloads.ts'

type Snapshot = { values: AnyObject; dirtyFields: Record<string, boolean>; form: FormApi }

const NOTHING_TO_SAVE = { presetChoice: 'none', saveAsPreset: false }

/* A preset once saved isn't saved again when creating is retried. */
const forgetPresetChoice = (form: FormApi) => form.batch(() => Object.entries(NOTHING_TO_SAVE).forEach(([field, value]) => form.change(field, value)))

/* Creates one instance or several from the new instance form. Whatever the Preset section asked for is
 * saved first, so a preset that can't be saved stops before anything is created. */
export const useNewInstanceSubmit = (
    { createDeployment, createFromPreset, savePreset, updatePreset, bulkDeploy }: ReturnType<typeof useStackDeploymentCreation>,
    sourcePreset: Deployment | undefined,
    onPresetSaved: () => void
) => {
    const navigate = useNavigate()
    const alert = useActionAlert()
    const [bulk, setBulk] = useState<Snapshot>()

    const savePresetAsked = useCallback(
        async ({ values, dirtyFields }: Snapshot): Promise<{ error?: string; saved?: boolean }> => {
            const choice = sourcePreset ? values.presetChoice : values.saveAsPreset ? 'new' : 'none'
            if (choice === 'new') {
                const { error } = await savePreset({ ...values, name: values.presetName })
                if (error) {
                    return { error: `Couldn't save the preset: ${error}` }
                }
                alert.success(`Saved preset ${values.presetName}`)
            } else if (choice === 'update' && sourcePreset) {
                /* Only what differs from the preset, under its own name and group: Update never renames or moves a shared preset. */
                const changes = Object.fromEntries(changedFromPreset(dirtyFields).map((field) => [field, true]))
                const { error } = await updatePreset(sourcePreset, { ...values, name: sourcePreset.name, groupName: sourcePreset.groupName }, changes)
                if (error) {
                    return { error: `Couldn't update the preset: ${error}` }
                }
                alert.success(`Saved preset ${sourcePreset.name}`)
            } else {
                return {}
            }
            onPresetSaved()
            return { saved: true }
        },
        [sourcePreset, savePreset, updatePreset, alert, onPresetSaved]
    )

    const submit = useCallback(
        async (values: AnyObject, form: FormApi) => {
            const { dirtyFields } = form.getState()
            const { error, saved } = await savePresetAsked({ values, dirtyFields, form })
            if (error) {
                return { [FORM_ERROR]: error }
            }
            if (saved) {
                forgetPresetChoice(form)
            }
            return sourcePreset ? createFromPreset(Number(sourcePreset.id), values, dirtyFields) : createDeployment(values)
        },
        [savePresetAsked, sourcePreset, createFromPreset, createDeployment]
    )

    /* The name isn't used when creating several, which names them from a prefix, so its errors don't stop it. Any other error is shown by submitting, which final-form refuses while there are errors. */
    const openBulk = useCallback((form: FormApi) => {
        const { values, errors = {}, dirtyFields } = form.getState()
        if (Object.keys(errors).some((field) => field !== 'name')) {
            void form.submit()
            return
        }
        setBulk({ values, dirtyFields, form })
    }, [])

    const closeBulk = useCallback(() => setBulk(undefined), [])

    const startBulk = useCallback(
        async (prefix: string, count: number, asked: AnyObject) => {
            if (!bulk) {
                return undefined
            }
            const { error: presetError, saved } = await savePresetAsked(bulk)
            if (presetError) {
                return { message: presetError, refused: true }
            }
            if (saved) {
                forgetPresetChoice(bulk.form)
                setBulk({ ...bulk, values: { ...bulk.values, ...NOTHING_TO_SAVE } })
            }
            const { deployments, error } = await bulkDeploy(withAsked(bulk.values, asked), prefix, count)
            if (error) {
                return error
            }
            const created = deployments?.length ?? count
            alert.success(`Deploying ${created} ${created === 1 ? 'instance' : 'instances'}…`)
            navigate('/instances')
            return undefined
        },
        [bulk, savePresetAsked, bulkDeploy, alert, navigate]
    )

    return { submit, bulk, openBulk, closeBulk, startBulk }
}
