import { useCallback, useEffect, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const readSaved = (storageKey: string) => {
    try {
        return sessionStorage.getItem(storageKey) ?? ''
    } catch {
        return ''
    }
}

const save = (storageKey: string, query: string) => {
    try {
        sessionStorage.setItem(storageKey, query)
    } catch {
        // Without storage the filters last only as long as the address, which is no reason to fail.
    }
}

/* A list's filters in the URL, so a filtered list can be shared as a link, and remembered for the tab,
 * so a plain link to the list (the sidebar, a breadcrumb) comes back to them. Per tab rather than for
 * good, so a filter doesn't quietly linger into another day's work. */
export const useSavedSearchParams = (storageKey: string) => {
    const [params, setParams] = useSearchParams()

    /* Arriving with an empty address brings back the tab's last one, before the first paint so the
     * unfiltered list never flashes. A link that names filters wins, and becomes the saved ones. */
    useLayoutEffect(() => {
        const saved = readSaved(storageKey)
        if (params.size === 0 && saved) {
            setParams(saved, { replace: true })
        }
        // Only on arrival: after that, an empty address means the filters were cleared.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => save(storageKey, params.toString()), [storageKey, params])

    /* Replacing rather than pushing, so typing a search doesn't leave a history entry per letter. An
     * empty value removes the parameter, so a plain list has a plain address. */
    const setParam = useCallback(
        (name: string, value: string) =>
            setParams(
                (current) => {
                    const next = new URLSearchParams(current)
                    if (value) {
                        next.set(name, value)
                    } else {
                        next.delete(name)
                    }
                    return next
                },
                { replace: true }
            ),
        [setParams]
    )

    return { params, setParams, setParam }
}
