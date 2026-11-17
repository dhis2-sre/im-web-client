import { createContext } from 'react'

/* Stands in for a stored sensitive value the browser never sees. */
export const STORED_VALUE_PLACEHOLDER = '••••••••'

export type SensitiveFieldHint = { help: string; placeholder?: string }

/* Names the preset, since nothing else on the form says which one it was filled from. */
export const keepPresetValue = (presetName: string): SensitiveFieldHint => ({ help: `Leave blank to keep ${presetName}'s value`, placeholder: STORED_VALUE_PLACEHOLDER })

/* What a blank sensitive field means, said under it: an edit keeps the stored value, a form filled from a preset keeps the preset's. */
export const SensitiveFieldHintContext = createContext<SensitiveFieldHint | undefined>({ help: 'Leave blank to keep current value', placeholder: STORED_VALUE_PLACEHOLDER })
