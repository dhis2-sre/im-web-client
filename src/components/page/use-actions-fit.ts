import { useLayoutEffect, useRef, useState } from 'react'

/* The least room the title keeps beside the actions before they collapse. */
const MIN_TITLE_WIDTH = 400
const GAP = 16

/* Whether a header's actions fit as buttons beside its title, leaving it at least MIN_TITLE_WIDTH. The
 * buttons' width is taken while they show and kept, so collapsing them can't make them seem to fit again
 * and flip back. It is measured before the first paint, so a narrow header never flashes the full row. */
export const useActionsFit = (enabled: boolean) => {
    const rowRef = useRef<HTMLDivElement>(null)
    const actionsRef = useRef<HTMLDivElement>(null)
    const [fits, setFits] = useState(true)
    const showingButtons = useRef(true)
    const buttonsWidth = useRef(0)

    useLayoutEffect(() => {
        const row = rowRef.current
        const actions = actionsRef.current
        if (!enabled || !row || !actions) {
            return
        }
        const measure = () => {
            if (showingButtons.current) {
                buttonsWidth.current = actions.scrollWidth
            }
            const next = row.clientWidth - buttonsWidth.current - GAP >= MIN_TITLE_WIDTH
            showingButtons.current = next
            setFits(next)
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(row)
        observer.observe(actions)
        return () => observer.disconnect()
    }, [enabled])

    return { rowRef, actionsRef, fits }
}
