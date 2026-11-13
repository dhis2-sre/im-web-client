import { createContext } from 'react'

export const KEEP_CURRENT_VALUE = 'Leave blank to keep current value'

/* What a blank sensitive field keeps: an edit keeps the stored value, a form filled from a preset keeps the preset's. Undefined when a blank keeps nothing. */
export const KeepValuePlaceholder = createContext<string | undefined>(KEEP_CURRENT_VALUE)
