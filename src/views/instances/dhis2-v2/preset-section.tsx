import { CheckboxFieldFF } from '@dhis2/ui'
import cx from 'classnames'
import type { FC } from 'react'
import { useEffect } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import { NameInput } from '../fields/name-input.tsx'
import styles from '../styles.module.css'

/* The blank new instance form's last section: keep this configuration as a preset as well. A form filled from a preset only prefills; presets change on their own pages. */
export const PresetSection: FC = () => {
    const form = useForm()
    const { values } = useFormState({ subscription: { values: true } })

    useEffect(() => {
        if (values.saveAsPreset && !form.getState().values.presetName) {
            form.change('presetName', form.getState().values.name)
        }
    }, [values.saveAsPreset, form])

    return (
        <>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Preset</legend>
                <Field name="saveAsPreset" type="checkbox" component={CheckboxFieldFF} label="Save this configuration as a preset" />
                {values.saveAsPreset && (
                    <NameInput fieldName="presetName" availabilityUrl="/presets/availability" label="Preset name" helpText="Unique among the presets in the group" />
                )}
            </fieldset>
            <hr className={styles.hr} />
        </>
    )
}
