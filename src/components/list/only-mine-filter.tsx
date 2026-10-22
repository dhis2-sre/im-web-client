import { Checkbox } from '@dhis2/ui'
import { useCallback, useContext, useState } from 'react'
import type { FC } from 'react'
import { AuthContext } from '../../contexts/auth-context.ts'

const readStored = (storageKey: string) => {
    try {
        return JSON.parse(localStorage.getItem(storageKey) ?? 'false') === true
    } catch {
        return false
    }
}

/* Whether a list shows only what the signed-in user owns. The choice is remembered per list, since
 * someone who wants only their instances may still want every database. */
export const useOnlyMine = (storageKey: string) => {
    const { currentUser } = useContext(AuthContext)
    const [onlyMine, setStored] = useState(() => readStored(storageKey))

    const setOnlyMine = useCallback(
        (value: boolean) => {
            setStored(value)
            try {
                localStorage.setItem(storageKey, JSON.stringify(value))
            } catch {
                // The choice then lasts only until reload, which is no reason to fail the toggle.
            }
        },
        [storageKey]
    )

    const isShown = useCallback((owner?: { id?: number }) => !onlyMine || owner?.id === currentUser?.id, [onlyMine, currentUser])

    return { onlyMine, setOnlyMine, isShown }
}

export const OnlyMineFilter: FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <Checkbox dense label={label} checked={checked} onChange={({ checked: next }) => onChange(next)} />
)
