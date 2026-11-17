import type { FC, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

/* The least room the title keeps beside the actions before they collapse. */
const MIN_TITLE_WIDTH = 400
const GAP = 16

/* A page's actions as buttons while they fit beside its title, and collapsed (into a menu, say) once
 * they would squeeze the title below MIN_TITLE_WIDTH. The buttons' width is taken while they show and
 * kept, so collapsing them can't make them seem to fit again and flip back. Goes in Page's actions. */
export const FittingActions: FC<{ children: (fits: boolean) => ReactNode }> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [fits, setFits] = useState(true)
    const showingButtons = useRef(true)
    const buttonsWidth = useRef(0)

    useEffect(() => {
        const actions = ref.current
        // The header's actions box, then the title row it shares with the title.
        const row = actions?.parentElement?.parentElement
        if (!actions || !row) {
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
        const observer = new ResizeObserver(measure)
        observer.observe(row)
        observer.observe(actions)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className={styles.fittingActions}>
            {children(fits)}
        </div>
    )
}
