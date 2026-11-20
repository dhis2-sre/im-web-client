import { CheckboxFieldFF } from '@dhis2/ui'
import type { FC } from 'react'
import { useEffect } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import { NameInput } from '../fields/name-input.tsx'
import styles from '../styles.module.css'
import { SectionCard } from './section-card.tsx'

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
        <SectionCard title="Preset" className={styles.presetCard}>
            <Field name="saveAsPreset" type="checkbox" component={CheckboxFieldFF} label="Save this configuration as a preset" />
            {values.saveAsPreset && (
                <div className={styles.grid}>
                    <NameInput fieldName="presetName" availabilityUrl="/presets/availability" label="Preset name" helpText="" />
                </div>
            )}
        </SectionCard>
    )
}
