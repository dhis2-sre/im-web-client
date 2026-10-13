import { useAlert } from '@dhis2/app-service-alerts'
import { Button, SingleSelectField } from '@dhis2/ui'
import cx from 'classnames'
import type { FC, MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-final-form'
import { useAuthAxios } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import fieldStyles from '../fields/fields.module.css'
import styles from '../styles.module.css'
import { usePresetSummary } from '../../presets/preset-summary.ts'
import { presetFormValues } from './preset-values.ts'

const ERROR_OPTIONS = { critical: true }

const presetKey = (preset: Deployment) => `${preset.groupName}/${preset.name}`

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

export const PresetPicker: FC<{ presets: Deployment[]; mainStackName: string; onDeleted: () => void; initialPresetId?: string }> = ({
    presets,
    mainStackName,
    onDeleted,
    initialPresetId,
}) => {
    const form = useForm()
    /* Kept by group and name rather than id, since replacing a preset gives it a new id. */
    const [selectedKey, setSelectedKey] = useState<string>()
    const selected = presets.find((preset) => presetKey(preset) === selectedKey)
    const selectedId = selected ? String(selected.id) : undefined
    const { show: showError } = useAlert(({ message }) => message, ERROR_OPTIONS)
    const [{ loading: loadingPreset }, fetchPreset] = useAuthAxios<Deployment>({ method: 'GET' }, { manual: true, autoCancel: false })
    const [{ loading: deleting }, deletePreset] = useAuthAxios({ method: 'DELETE' }, { manual: true, autoCancel: false })

    const loadPreset = useCallback(
        async ({ selected }: { selected: string }) => {
            const preset = presets.find(({ id }) => String(id) === selected)
            setSelectedKey(preset && presetKey(preset))
            try {
                const { data: preset } = await fetchPreset({ url: `/deployments/${selected}` })
                form.restart(presetFormValues(preset, mainStackName, form.getState().initialValues ?? {}))
            } catch (error) {
                showError({ message: `Could not load the preset: ${error instanceof Error ? error.message : error}` })
            }
        },
        [fetchPreset, form, mainStackName, presets, showError]
    )

    /* The presets list's Load opens this form with the preset in the url; it is applied once, as soon as the presets have arrived. */
    const appliedInitial = useRef(false)
    useEffect(() => {
        if (appliedInitial.current || !initialPresetId || !presets.some(({ id }) => String(id) === initialPresetId)) {
            return
        }
        appliedInitial.current = true
        void loadPreset({ selected: initialPresetId })
    }, [initialPresetId, presets, loadPreset])

    const removePreset = useCallback(async () => {
        try {
            await deletePreset({ url: `/deployments/${selectedId}` })
            setSelectedKey(undefined)
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
                <legend className={styles.legend}>Presets</legend>
                <div className={styles.presetRow}>
                    <SingleSelectField
                        className={fieldStyles.field}
                        label="Start from a preset"
                        placeholder="Choose a preset"
                        helpText="Fills the form with the preset's settings. Passwords and other sensitive values are not filled in."
                        selected={selectedId}
                        onChange={loadPreset}
                        loading={loadingPreset}
                        filterable
                        noMatchText="No preset matches"
                    >
                        {presets.map((preset) => (
                            <PresetOption key={preset.id} value={String(preset.id)} label={`${preset.name} (${preset.groupName})`} preset={preset} mainStackName={mainStackName} />
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
