import { Button, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import cx from 'classnames'
import type { AnyObject, FormApi } from 'final-form'
import type { FC, MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-final-form'
import { Link } from 'react-router-dom'
import { ConfirmationModal, useActionAlert } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import { usePresetSummary } from '../../presets/preset-summary.ts'
import fieldStyles from '../fields/fields.module.css'
import styles from '../styles.module.css'
import { presetFormValues } from './preset-values.ts'

const BLANK = 'blank'
const FIELDS_OWN_TO_THE_SECTION = ['presetChoice', 'presetName', 'saveAsPreset']

type PresetOptionProps = {
    label: string
    value: string
    preset: Deployment
    mainStackName: string
    active?: boolean
    onClick?: (payload: object, event: MouseEvent) => void
}

/* A SingleSelectOption only takes a string label, so this renders the same row with the preset's main settings after it. The select still filters and shows the selection by label. */
const PresetOption: FC<PresetOptionProps> = ({ label, value, preset, mainStackName, active, onClick }) => {
    const { version, database, storage, companions } = usePresetSummary(preset, mainStackName)
    const details = [version, database, storage, ...companions].filter(Boolean)

    return (
        <div className={cx(styles.presetOption, { [styles.active]: active })} data-value={value} onClick={(event) => onClick?.({}, event)}>
            <span>{label}</span>
            {details.length > 0 && <span className={styles.presetDetails}>{details.join(' · ')}</span>}
        </div>
    )
}

/* The form keeps dirty fields when it is reinitialised, which would let a value changed before the preset loaded survive filling from it. Filling replaces everything. */
const restart = (form: FormApi, values: AnyObject) => {
    form.setConfig('keepDirtyOnReinitialize', false)
    form.restart(values)
    form.setConfig('keepDirtyOnReinitialize', true)
}

/* Picking a preset fills the form from it, so its values become the form's initial values and final-form's dirty fields are exactly what differs from it. */
export const PresetPicker: FC<{ presets: Deployment[]; mainStackName: string; initialPresetId?: string; blankValues: AnyObject; onLoaded: (preset?: Deployment) => void }> = ({
    presets,
    mainStackName,
    initialPresetId,
    blankValues,
    onLoaded,
}) => {
    const form = useForm()
    const alert = useActionAlert()
    const [loaded, setLoaded] = useState<Deployment>()
    const [pending, setPending] = useState<string>()
    const [{ loading }, fetchPreset] = useAuthAxios<Deployment>({ method: 'GET' }, { manual: true, autoCancel: false })
    const [, fetchAvailability] = useAuthAxios<{ names: string[]; taken: string[] }>({ method: 'GET', url: '/deployments/bulk/availability' }, { manual: true, autoCancel: false })

    /* The preset's name numbered from 1, skipping numbers the group's instances already use. If the check fails, the name field's own check flags a taken name. */
    const firstFreeName = useCallback(
        async ({ name, groupName }: Deployment) => {
            try {
                const { data } = await fetchAvailability({ params: { group: groupName, prefix: name, count: 50 } })
                const taken = new Set(data.taken)
                return data.names.find((candidate) => !taken.has(candidate)) ?? `${name}-1`
            } catch {
                return `${name}-1`
            }
        },
        [fetchAvailability]
    )

    const loadPreset = useCallback(
        async (id: string) => {
            try {
                const { data: preset } = await fetchPreset({ url: `/presets/${id}` })
                restart(form, { ...presetFormValues(preset, mainStackName, blankValues, { blankMasked: true }), name: await firstFreeName(preset) })
                setLoaded(preset)
                onLoaded(preset)
            } catch (error) {
                alert.error(`Couldn't load the preset: ${error instanceof Error ? error.message : error}`)
            }
        },
        [fetchPreset, form, mainStackName, blankValues, firstFreeName, onLoaded, alert]
    )

    /* Use preset opens this form with the preset in the url; it is applied once, as soon as the presets have arrived. */
    const appliedInitial = useRef(false)
    useEffect(() => {
        if (appliedInitial.current || !initialPresetId || !presets.some(({ id }) => String(id) === initialPresetId)) {
            return
        }
        appliedInitial.current = true
        void loadPreset(initialPresetId)
    }, [initialPresetId, presets, loadPreset])

    /* Blank is the form as it opens, keeping the chosen group. */
    const apply = useCallback(
        (selected: string) => {
            if (selected !== BLANK) {
                void loadPreset(selected)
                return
            }
            restart(form, { ...blankValues, groupName: form.getState().values.groupName })
            setLoaded(undefined)
            onLoaded(undefined)
        },
        [form, blankValues, loadPreset, onLoaded]
    )

    /* With a preset loaded a change is anything that differs from it; on a blank form it is a field someone touched, since some fields fill themselves in. */
    const choose = useCallback(
        (selected: string) => {
            const { dirtyFields, touched = {} } = form.getState()
            const changed = Object.keys(dirtyFields).some((field) => dirtyFields[field] && !FIELDS_OWN_TO_THE_SECTION.includes(field) && (loaded || touched[field]))
            if (changed) {
                setPending(selected)
            } else {
                apply(selected)
            }
        },
        [form, loaded, apply]
    )

    if (presets.length === 0) {
        return null
    }

    const pendingName = presets.find(({ id }) => String(id) === pending)?.name

    return (
        <>
            <div className={styles.presetBar}>
                <SingleSelectField
                    className={fieldStyles.field}
                    label="Start from a preset"
                    selected={loaded ? String(loaded.id) : BLANK}
                    onChange={({ selected }) => selected !== (loaded ? String(loaded.id) : BLANK) && choose(selected)}
                    loading={loading}
                    filterable
                    noMatchText="No preset matches"
                >
                    <SingleSelectOption value={BLANK} label="Blank (no preset)" />
                    {presets.map((preset) => (
                        <PresetOption key={preset.id} value={String(preset.id)} label={`${preset.name} (${preset.groupName})`} preset={preset} mainStackName={mainStackName} />
                    ))}
                </SingleSelectField>
                {loaded && (
                    <p className={styles.presetNote}>
                        Filled from <strong>{loaded.name}</strong>
                        <Link to={`/presets/${loaded.id}`}>View preset</Link>
                        <Button small secondary onClick={() => void loadPreset(String(loaded.id))}>
                            Reset to preset
                        </Button>
                    </p>
                )}
            </div>
            <hr className={styles.hr} />
            {pending && (
                <ConfirmationModal
                    title="Replace your changes?"
                    confirmLabel="Replace"
                    cancelLabel="Keep editing"
                    onCancel={() => setPending(undefined)}
                    onConfirm={() => {
                        setPending(undefined)
                        apply(pending)
                    }}
                >
                    {pending === BLANK ? (
                        "Starting from a blank form clears everything you've changed."
                    ) : (
                        <>
                            Filling the form from <strong>{pendingName}</strong> replaces everything you&apos;ve changed.
                        </>
                    )}
                </ConfirmationModal>
            )}
        </>
    )
}
