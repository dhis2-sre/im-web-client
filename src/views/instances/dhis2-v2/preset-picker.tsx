import { useAlert } from '@dhis2/app-service-alerts'
import { Button, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import cx from 'classnames'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import fieldStyles from '../fields/fields.module.css'
import styles from '../styles.module.css'
import { presetFormValues } from './preset-values.ts'

const ERROR_OPTIONS = { critical: true }

export const PresetPicker: FC<{ presets: Deployment[]; mainStackName: string; onDeleted: () => void }> = ({ presets, mainStackName, onDeleted }) => {
    const form = useForm()
    const [selectedId, setSelectedId] = useState<string>()
    const { show: showError } = useAlert(({ message }) => message, ERROR_OPTIONS)
    const [{ loading: loadingPreset }, fetchPreset] = useAuthAxios<Deployment>({ method: 'GET' }, { manual: true, autoCancel: false })
    const [{ loading: deleting }, deletePreset] = useAuthAxios({ method: 'DELETE' }, { manual: true, autoCancel: false })

    const loadPreset = useCallback(
        async ({ selected }: { selected: string }) => {
            setSelectedId(selected)
            try {
                const { data: preset } = await fetchPreset({ url: `/deployments/${selected}` })
                form.restart(presetFormValues(preset, mainStackName, form.getState().initialValues ?? {}))
            } catch (error) {
                showError({ message: `Could not load the preset: ${error instanceof Error ? error.message : error}` })
            }
        },
        [fetchPreset, form, mainStackName, showError]
    )

    const removePreset = useCallback(async () => {
        try {
            await deletePreset({ url: `/deployments/${selectedId}` })
            setSelectedId(undefined)
            onDeleted()
        } catch (error) {
            showError({ message: `Could not delete the preset: ${error instanceof Error ? error.message : error}` })
        }
    }, [deletePreset, selectedId, onDeleted, showError])

    if (presets.length === 0) {
        return null
    }

    return (
        <>
            <fieldset className={cx(styles.fieldset, styles.main)}>
                <legend className={styles.legend}>Preset</legend>
                <div className={styles.presetRow}>
                    <SingleSelectField
                        className={fieldStyles.field}
                        label="Start from a preset"
                        placeholder="Choose a preset"
                        helpText="Fills the form with the preset's settings. Passwords and other sensitive values are not filled in."
                        selected={selectedId}
                        onChange={loadPreset}
                        loading={loadingPreset}
                        filterable={presets.length > 7}
                    >
                        {presets.map((preset) => (
                            <SingleSelectOption key={preset.id} value={String(preset.id)} label={`${preset.name} (${preset.groupName})`} />
                        ))}
                    </SingleSelectField>
                    {selectedId && (
                        <Button small destructive secondary loading={deleting} onClick={removePreset}>
                            Delete preset
                        </Button>
                    )}
                </div>
            </fieldset>
            <hr className={styles.hr} />
        </>
    )
}
