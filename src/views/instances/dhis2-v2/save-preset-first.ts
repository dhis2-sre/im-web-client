import type { AnyObject, FormApi } from 'final-form'

/* Saves the preset first when the box is ticked, so a preset that can't be saved stops before anything is created,
 * then unticks it, so retrying a create that failed doesn't save the preset a second time. Returns the error, if any. */
export const savePresetFirst = async (values: AnyObject, form: Pick<FormApi, 'change'>, savePreset: (values: AnyObject) => Promise<string | undefined>) => {
    if (!values.saveAsPreset) {
        return undefined
    }
    const error = await savePreset(values)
    if (!error) {
        form.change('saveAsPreset', false)
    }
    return error
}
