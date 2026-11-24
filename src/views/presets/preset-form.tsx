import { Button } from '@dhis2/ui'
import { FORM_ERROR, setIn } from 'final-form'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useCallback, useMemo } from 'react'
import { Form, useFormState } from 'react-final-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Page, useActionAlert } from '../../components/index.ts'
import { useAuthAxios, useUncopyable } from '../../hooks/index.ts'
import { useGroupedStackParameters } from '../../hooks/use-grouped-stack-parameters.ts'
import { useStackDeploymentCreation } from '../../hooks/use-stack-deployment-creation.ts'
import type { Deployment } from '../../types/index.ts'
import { initialValuesFor, useCompanionRemovalConfirm } from '../instances/dhis2-v2/companion-removal.tsx'
import { deploymentHasInstanceOf } from '../instances/dhis2-v2/deployment-instances.ts'
import { Dhis2V2Form, STACK_ID } from '../instances/dhis2-v2/dhis2-v2-form.tsx'
import { presetFormValues } from '../instances/dhis2-v2/preset-values.ts'
import { DEFAULT_TTL_SECONDS } from '../instances/fields/ttl-presets.ts'
import styles from '../instances/styles.module.css'
import { CopyNotice } from './copy-notice.tsx'
import { missingUncopyable } from './preset-payloads.ts'

type Kind = 'new' | 'edit' | 'duplicate' | 'instance'

const kindOf = ({ id, from, instanceId }: { id?: string; from: string | null; instanceId: string | null }): Kind => {
    if (id) {
        return 'edit'
    }
    if (from) {
        return 'duplicate'
    }
    return instanceId ? 'instance' : 'new'
}

const NEW_VALUES = { ttl: DEFAULT_TTL_SECONDS }

/* Saving before the stack parameters load would store a preset without them. */
const PresetFormActions: FC<{ isEdit: boolean; parametersReady: boolean; onCancel: () => void }> = ({ isEdit, parametersReady, onCancel }) => {
    const { submitError, submitting, modifiedSinceLastSubmit, pristine, invalid } = useFormState({
        subscription: { submitError: true, submitting: true, modifiedSinceLastSubmit: true, pristine: true, invalid: true },
    })
    const disabled = !parametersReady || (isEdit && pristine) || submitting || (invalid && !submitError) || (submitError && !modifiedSinceLastSubmit)
    return (
        <div className={styles.actions}>
            <Button primary disabled={disabled} loading={submitting} type="submit">
                {isEdit ? 'Save' : 'Save preset'}
            </Button>
            <Button secondary disabled={submitting} onClick={onCancel}>
                Cancel
            </Button>
        </div>
    )
}

/* New, edit, duplicate and save-from-an-instance share one page. Only edit changes the preset it
 * read; the others copy their source into a new preset, which can't carry its sensitive values. */
export const PresetForm: FC = () => {
    const navigate = useNavigate()
    const alert = useActionAlert()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const from = searchParams.get('from')
    const instanceId = searchParams.get('instance')
    const kind = kindOf({ id, from, instanceId })
    const sourceUrl = { new: undefined, edit: `/presets/${id}`, duplicate: `/presets/${from}`, instance: `/deployments/${instanceId}` }[kind]
    const [{ data: source, error }] = useAuthAxios<Deployment>({ url: sourceUrl }, { manual: !sourceUrl, useCache: false })

    const { companions, getIncludedParameters, loading: parametersLoading, error: parametersError } = useGroupedStackParameters(STACK_ID)
    const { savePreset, updatePreset, activeStacks } = useStackDeploymentCreation(STACK_ID, getIncludedParameters, companions)
    const uncopyable = useUncopyable([STACK_ID, ...companions.map((companion) => companion.name)])

    const parent =
        kind === 'new' || !source
            ? { label: 'Presets', to: '/presets' }
            : { label: source.name ?? '', to: kind === 'instance' ? `/instances/${source.id}/details` : `/presets/${source.id}` }
    const cancel = useCallback(() => navigate(parent.to), [navigate, parent.to])

    const saved = useCallback(
        ({ id, error }: { id?: number; error?: string }, name: string) => {
            if (error) {
                return { [FORM_ERROR]: error }
            }
            alert.success(`Saved preset ${name}`)
            navigate(`/presets/${id}`)
            return undefined
        },
        [alert, navigate]
    )

    const saveEdit = useCallback(
        async (values: AnyObject, dirtyFields: Record<string, boolean>) => (source ? saved(await updatePreset(source, values, dirtyFields), values.name) : undefined),
        [saved, updatePreset, source]
    )
    const { submit: submitEdit, modal } = useCompanionRemovalConfirm({ deployment: kind === 'edit' ? source : undefined, companions, save: saveEdit, noun: 'preset' })
    const submitNew = useCallback(async (values: AnyObject) => saved(await savePreset(values), values.name), [saved, savePreset])

    /* The pgAdmin login and the like are required with no default, so a copy that can't carry them
     * has to ask for them again. */
    const isCopy = kind === 'duplicate' || kind === 'instance'
    const validate = useCallback(
        (values: AnyObject) =>
            isCopy ? Object.entries(missingUncopyable(values, uncopyable, activeStacks(values))).reduce((errors, [field, message]) => setIn(errors, field, message), {}) : {},
        [isCopy, uncopyable, activeStacks]
    )

    const initialValues = useMemo(() => {
        if (kind === 'new') {
            return NEW_VALUES
        }
        if (!source) {
            return undefined
        }
        if (kind === 'edit') {
            return { ...initialValuesFor(source), name: source.name, groupName: source.groupName }
        }
        return { ...presetFormValues(source, { mainStackName: STACK_ID, initialValues: NEW_VALUES }), name: kind === 'duplicate' ? `${source.name}-copy` : source.name }
    }, [kind, source])

    const loadError =
        kind === 'instance'
            ? (error || (source && !deploymentHasInstanceOf(source, STACK_ID))) && {
                  title: "Couldn't load the instance",
                  description: error ? error.message : 'Only DHIS2 instances can be saved as presets.',
              }
            : error && { title: "Couldn't load the preset", description: error.message }

    /* The fetch starts in an effect, so the first render has neither data nor error and isn't loading yet. */
    if (!initialValues || loadError) {
        return <Page parent={parent} loading={!loadError} error={loadError || undefined} />
    }

    const title = { new: 'New preset', edit: `Edit ${source?.name}`, duplicate: `Duplicate ${source?.name}`, instance: `New preset from ${source?.name}` }[kind]

    return (
        <Page parent={parent} title={title} description={kind === 'new' ? 'A saved configuration to start new instances from. Nothing is deployed.' : undefined}>
            <div className={styles.form}>
                {isCopy && source && <CopyNotice source={source.name ?? ''} />}
                <Form onSubmit={kind === 'edit' ? submitEdit : submitNew} initialValues={initialValues} validate={validate} keepDirtyOnReinitialize>
                    {({ handleSubmit }) => (
                        <Dhis2V2Form
                            handleSubmit={handleSubmit}
                            handleCancel={cancel}
                            mode={kind === 'edit' ? 'edit-preset' : 'new-preset'}
                            deployment={kind === 'edit' ? source : undefined}
                            actions={<PresetFormActions isEdit={kind === 'edit'} parametersReady={!parametersLoading && !parametersError} onCancel={cancel} />}
                        />
                    )}
                </Form>
            </div>
            {modal}
        </Page>
    )
}
