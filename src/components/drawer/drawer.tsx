import { Button, IconCross24, Layer } from '@dhis2/ui'
import { useCallback, useEffect, useId, useRef } from 'react'
import type { FC, ReactNode } from 'react'
import styles from './drawer.module.css'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/* A panel that slides in from the right over the page, for detail that would stretch the page if it
 * opened in place. It closes on Escape, a click outside or its close button, keeps focus inside
 * while open and hands it back to whatever opened it. */
export const Drawer: FC<{ title: ReactNode; description?: ReactNode; onClose: () => void; children: ReactNode }> = ({ title, description, onClose, children }) => {
    const panel = useRef<HTMLDialogElement | null>(null)
    const titleId = useId()
    const descriptionId = useId()

    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
        return () => opener?.focus()
    }, [])

    /* The layer mounts its contents a render after the drawer, so focus moves in once the panel is
     * actually there rather than from the drawer's own mount. */
    const attach = useCallback((node: HTMLDialogElement | null) => {
        if (node && !panel.current) {
            node.querySelector<HTMLElement>(FOCUSABLE)?.focus()
        }
        panel.current = node
    }, [])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
                return
            }
            if (event.key !== 'Tab' || !panel.current) {
                return
            }
            const focusable = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [onClose])

    return (
        <Layer translucent onBackdropClick={onClose}>
            <dialog ref={attach} open className={styles.drawer} aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
                <header className={styles.header}>
                    <div className={styles.heading}>
                        <h2 id={titleId} className={styles.title}>
                            {title}
                        </h2>
                        {description && (
                            <p id={descriptionId} className={styles.description}>
                                {description}
                            </p>
                        )}
                    </div>
                    <Button small secondary icon={<IconCross24 />} aria-label="Close" title="Close" onClick={onClose} />
                </header>
                <div className={styles.body}>{children}</div>
            </dialog>
        </Layer>
    )
}
