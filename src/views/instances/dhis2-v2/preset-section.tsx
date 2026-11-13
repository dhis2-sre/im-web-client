import { CheckboxFieldFF, Help, RadioFieldFF } from '@dhis2/ui'
import cx from 'classnames'
import type { FC } from 'react'
import { useEffect } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import { useAuth } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import { CopyNotice } from '../../presets/copy-notice.tsx'
import { canWritePreset, changedFromPreset, describeChanges } from '../../presets/preset-payloads.ts'
import { NameInput } from '../fields/name-input.tsx'
import styles from '../styles.module.css'

/* The new instance form's last section: keep this configuration as a preset as well. Filled from a preset, it appears once something differs from it and never updates the preset unless chosen. */
export const PresetSection: FC<{ sourcePreset?: Deployment; displayNames: Record<string, string> }> = ({ sourcePreset, displayNames }) => {
    const form = useForm()
    const { values, dirtyFields } = useFormState({ subscription: { values: true, dirtyFields: true } })
    const { currentUser, isAdministrator } = useAuth()
    const changed = sourcePreset ? changedFromPreset(dirtyFields) : []
    const hidden = !!sourcePreset && changed.length === 0
    const naming = sourcePreset ? values.presetChoice === 'new' : !!values.saveAsPreset

    /* Undoing every change hides the choices, so whatever was chosen falls back to not saving. */
    useEffect(() => {
        if (hidden && values.presetChoice !== 'none') {
            form.change('presetChoice', 'none')
        }
    }, [hidden, values.presetChoice, form])

    useEffect(() => {
        if (naming && !form.getState().values.presetName) {
            form.change('presetName', form.getState().values.name)
        }
    }, [naming, form])

    /* Saving a new preset from a preset makes its required logins required again; showing their errors straight away says why Create is disabled. */
    useEffect(() => {
        if (sourcePreset && naming) {
            form.getRegisteredFields()
                .filter((field) => form.getFieldState(field)?.error)
                .forEach((field) => form.blur(field))
        }
    }, [sourcePreset, naming, form])

    if (hidden) {
        return null
    }

    const canUpdate = !!sourcePreset && canWritePreset(sourcePreset, currentUser, isAdministrator)

    return (
        <>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Preset</legend>
                {sourcePreset ? (
                    <>
                        <Field name="presetChoice" type="radio" value="none" component={RadioFieldFF} label="Don't save as a preset" />
                        <div>
                            <Field
                                name="presetChoice"
                                type="radio"
                                value="update"
                                component={RadioFieldFF}
                                disabled={!canUpdate}
                                label={`Update "${sourcePreset.name}" with these changes`}
                            />
                            <Help className={styles.presetChoiceHelp}>
                                {canUpdate ? describeChanges(changed, displayNames) : `Only ${sourcePreset.user?.email ?? 'its owner'} or an admin can change this preset`}
                            </Help>
                        </div>
                        <Field name="presetChoice" type="radio" value="new" component={RadioFieldFF} label="Save as a new preset" />
                        {naming && <CopyNotice source={sourcePreset.name ?? ''} target="preset" onForm />}
                    </>
                ) : (
                    <Field name="saveAsPreset" type="checkbox" component={CheckboxFieldFF} label="Save this configuration as a preset" />
                )}
                {naming && <NameInput fieldName="presetName" availabilityUrl="/presets/availability" label="Preset name" helpText="Unique among the presets in the group" />}
            </fieldset>
            <hr className={styles.hr} />
        </>
    )
}
