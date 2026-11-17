import { createContext } from 'react'

/* Stands in for a stored sensitive value the browser never sees. */
export const STORED_VALUE_PLACEHOLDER = '••••••••'

export type SensitiveFieldHint = { help: string; placeholder?: string }

export const KEEP_PRESET_VALUE: SensitiveFieldHint = { help: 'Leave blank to keep preset value', placeholder: STORED_VALUE_PLACEHOLDER }
export const NOT_COPIED_FROM_PRESET: SensitiveFieldHint = { help: 'Not copied from the preset' }

/* What a blank sensitive field means, said under it: an edit keeps the stored value, a form filled from a preset keeps the preset's, a copy keeps nothing. */
export const SensitiveFieldHintContext = createContext<SensitiveFieldHint | undefined>({ help: 'Leave blank to keep current value', placeholder: STORED_VALUE_PLACEHOLDER })
