import { DropdownButton, IconCheckmarkCircle16, Input, Menu, MenuDivider, MenuItem, MenuSectionHeader } from '@dhis2/ui'
import type { AnyObject, FormApi } from 'final-form'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { ConfirmationModal, useActionAlert } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import { usePresetSummary } from '../../presets/preset-summary.ts'
import styles from '../styles.module.css'
import { presetFormValues } from './preset-values.ts'

const BLANK = 'blank'
const FIELDS_OWN_TO_THE_SECTION = ['presetName', 'saveAsPreset']

/* With a preset loaded a change is anything that differs from it; on a blank form it is a field someone touched, since some fields fill themselves in. */
const hasChanges = (dirtyFields: Record<string, boolean>, touched: Record<string, boolean>, fromPreset: boolean) =>
    Object.keys(dirtyFields).some((field) => dirtyFields[field] && !FIELDS_OWN_TO_THE_SECTION.includes(field) && (fromPreset || touched[field]))

/* The form keeps dirty fields when it is reinitialised, which would let a value changed before the preset loaded survive filling from it. Filling replaces everything. */
const restart = (form: FormApi, values: AnyObject) => {
    form.setConfig('keepDirtyOnReinitialize', false)
    form.restart(values)
    form.setConfig('keepDirtyOnReinitialize', true)
}

const PresetLabel: FC<{ preset: Deployment; mainStackName: string }> = ({ preset, mainStackName }) => {
    const { version, database, storage, companions } = usePresetSummary(preset, mainStackName)
    const details = [version, database, storage, ...companions].filter(Boolean)

    return (
        <span className={styles.presetItem}>
            <span>{preset.name}</span>
            {details.length > 0 && <span className={styles.presetDetails}>{details.join(' · ')}</span>}
        </span>
    )
}

/* In order of first appearance, so the list keeps the order the server gives. */
const byGroup = (presets: Deployment[]) => {
    const groups = new Map<string, Deployment[]>()
    for (const preset of presets) {
        groups.set(preset.groupName, [...(groups.get(preset.groupName) ?? []), preset])
    }
    return [...groups.entries()]
}

/* Filling from a preset is something you do, not something the form is: the button always reads the same, and a note beside it confirms the fill only until the form is changed. The preset's values become the form's initial values, so final-form's dirty fields are what has changed since. */
export const FillFromPreset: FC<{ presets: Deployment[]; mainStackName: string; initialPresetId?: string; blankValues: AnyObject; onLoaded: (preset?: Deployment) => void }> = ({
    presets,
    mainStackName,
    initialPresetId,
    blankValues,
    onLoaded,
}) => {
    const form = useForm()
    const alert = useActionAlert()
    const { dirtyFields, touched = {} } = useFormState({ subscription: { dirtyFields: true, touched: true } })
    const [open, setOpen] = useState(false)
    const [filter, setFilter] = useState('')
    const [loaded, setLoaded] = useState<Deployment>()
    const [pending, setPending] = useState<string>()
    const [status, setStatus] = useState<string>()
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

    const settle = useCallback(
        (preset?: Deployment) => {
            setLoaded(preset)
            onLoaded(preset)
        },
        [onLoaded]
    )

    /* The note is about the fill, so it goes for good once the form is changed, even if the change is later taken back. */
    const changed = hasChanges(dirtyFields, touched, Boolean(loaded))
    useEffect(() => {
        if (changed) {
            setStatus(undefined)
        }
    }, [changed])

    const loadPreset = useCallback(
        async (id: string) => {
            try {
                const { data: preset } = await fetchPreset({ url: `/presets/${id}` })
                restart(form, { ...presetFormValues(preset, mainStackName, blankValues, { blankMasked: true }), name: await firstFreeName(preset) })
                settle(preset)
                setStatus(`Filled from ${preset.name}`)
            } catch (error) {
                alert.error(`Couldn't load the preset: ${error instanceof Error ? error.message : error}`)
            }
        },
        [fetchPreset, form, mainStackName, blankValues, firstFreeName, settle, alert]
    )

    /* Create instance on a preset opens this form with the preset in the url; it is applied once, as soon as the presets have arrived. */
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
            settle(undefined)
            setStatus('Cleared the form')
        },
        [loadPreset, form, blankValues, settle]
    )

    const choose = useCallback(
        (selected: string) => {
            setOpen(false)
            setFilter('')
            if (changed) {
                setPending(selected)
            } else {
                apply(selected)
            }
        },
        [changed, apply]
    )

    const groups = useMemo(() => {
        const query = filter.trim().toLowerCase()
        return byGroup(query ? presets.filter(({ name, groupName }) => `${name} ${groupName}`.toLowerCase().includes(query)) : presets)
    }, [presets, filter])

    if (presets.length === 0) {
        return null
    }

    const pendingName = presets.find(({ id }) => String(id) === pending)?.name

    return (
        <div className={styles.formToolbar}>
            <DropdownButton
                secondary
                small
                disabled={loading}
                open={open}
                onClick={({ open: next }) => {
                    setOpen(next)
                    setFilter('')
                }}
                component={
                    /* The popper focuses this panel as it opens, as FlyoutMenu's does; it hands focus on to the search. */
                    <div
                        className={styles.presetMenu}
                        tabIndex={-1}
                        onFocus={(event) => event.target === event.currentTarget && event.currentTarget.querySelector('input')?.focus()}
                    >
                        <div className={styles.presetSearch}>
                            <Input dense placeholder="Search presets" value={filter} onChange={({ value }) => setFilter(value ?? '')} />
                        </div>
                        <Menu dense>
                            {groups.length === 0 && <MenuItem dense disabled label="No preset matches" />}
                            {groups.flatMap(([group, members], index) => [
                                /* The search's own bottom edge already divides the first group from it. */
                                <MenuSectionHeader key={`group-${group}`} dense hideDivider={index === 0} label={group} />,
                                ...members.map((preset) => (
                                    <MenuItem
                                        key={preset.id}
                                        dense
                                        /* The library takes ariaLabel for a label that isn't a string, but its types leave it out. */
                                        {...{ ariaLabel: preset.name }}
                                        label={<PresetLabel preset={preset} mainStackName={mainStackName} />}
                                        onClick={() => choose(String(preset.id))}
                                    />
                                )),
                            ])}
                            <MenuDivider dense />
                            <MenuItem dense label="Blank form" onClick={() => choose(BLANK)} />
                        </Menu>
                    </div>
                }
            >
                Fill from preset
            </DropdownButton>
            {status && (
                <output className={styles.fillStatus}>
                    <IconCheckmarkCircle16 color="var(--colors-green600)" />
                    {status}
                </output>
            )}
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
        </div>
    )
}
