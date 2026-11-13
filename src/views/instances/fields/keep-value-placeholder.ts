import { createContext } from 'react'

export const KEEP_CURRENT_VALUE = 'Leave blank to keep current value'

/* What a blank sensitive field keeps: an edit keeps the stored value, a form filled from a preset keeps the preset's. */
export const KeepValuePlaceholder = createContext(KEEP_CURRENT_VALUE)
