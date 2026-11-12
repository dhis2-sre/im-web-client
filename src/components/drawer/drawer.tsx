import { Button, IconCross16, Layer } from '@dhis2/ui'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, FC, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import styles from './drawer.module.css'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Size = 'default' | 'wide'

// Matches the widths in drawer.module.css, which stay the source of truth until someone resizes
const DEFAULT_WIDTH: Record<Size, number> = { default: 520, wide: 960 }
// Never narrower than a drawer opens at, so the default 520px drawer isn't forced wider
const MIN_WIDTH = 540
const minWidth = (size: Size) => Math.min(MIN_WIDTH, DEFAULT_WIDTH[size])
// Always leave a strip of the page showing, so a click outside can still close the drawer
const PAGE_GUTTER = 64
const STEP = 16
const BIG_STEP = 80

const storageKey = (size: Size) => `drawerWidth.${size}`
const maxWidth = (size: Size) => Math.max(minWidth(size), window.innerWidth - PAGE_GUTTER)
const clamp = (size: Size, width: number) => Math.round(Math.min(maxWidth(size), Math.max(minWidth(size), width)))

const readWidth = (size: Size) => {
    try {
        const stored = Number(localStorage.getItem(storageKey(size)))
        return stored > 0 ? stored : null
    } catch {
        return null
    }
}

const storeWidth = (size: Size, width: number | null) => {
    try {
        if (width === null) {
            localStorage.removeItem(storageKey(size))
        } else {
            localStorage.setItem(storageKey(size), String(width))
        }
    } catch {
        // The width then lasts only until reload, which is no reason to fail the resize.
    }
}

/* A panel that slides in from the right over the page, for detail that would stretch the page if it
 * opened in place. It closes on Escape, a click outside or its close button, keeps focus inside
 * while open and hands it back to whatever opened it. */
export const Drawer: FC<{
    title: ReactNode
    description?: ReactNode
    // Shown in the header beside Close, for what acts on the whole drawer rather than a part of it
    actions?: ReactNode
    // Under the header and outside the scrolling body, so they stay put
    tabs?: ReactNode
    size?: Size
    onClose: () => void
    children: ReactNode
}> = ({ title, description, actions, tabs, size = 'default', onClose, children }) => {
    const panel = useRef<HTMLDialogElement | null>(null)
    const titleId = useId()
    const descriptionId = useId()
    // null is the default width from the stylesheet; a number is one the user dragged or keyed to
    const [width, setWidth] = useState(() => readWidth(size))
    const [dragging, setDragging] = useState(false)

    useEffect(() => {
        if (!dragging) {
            storeWidth(size, width)
        }
    }, [size, width, dragging])

    // The left edge is the one that moves, so dragging left makes the drawer wider
    const startDrag = (event: ReactPointerEvent<HTMLHRElement>) => {
        if (event.button !== 0 || !panel.current) {
            return
        }
        event.preventDefault()
        const handle = event.currentTarget
        const startX = event.clientX
        const startWidth = panel.current.offsetWidth
        const onMove = (move: PointerEvent) => setWidth(clamp(size, startWidth + startX - move.clientX))
        const onEnd = () => {
            handle.removeEventListener('pointermove', onMove)
            setDragging(false)
        }
        handle.setPointerCapture(event.pointerId)
        handle.addEventListener('pointermove', onMove)
        handle.addEventListener('lostpointercapture', onEnd, { once: true })
        setDragging(true)
    }

    const current = clamp(size, width ?? DEFAULT_WIDTH[size])
    const resizeByKey = (event: ReactKeyboardEvent<HTMLHRElement>) => {
        const step = event.shiftKey ? BIG_STEP : STEP
        const next = { ArrowLeft: current + step, ArrowRight: current - step, Home: minWidth(size), End: maxWidth(size) }[event.key]
        if (next !== undefined) {
            event.preventDefault()
            setWidth(clamp(size, next))
        } else if (event.key === 'Enter') {
            event.preventDefault()
            setWidth(null)
        }
    }

    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
        return () => opener?.focus()
    }, [])

    /* The layer mounts its contents a render after the drawer, so focus moves in once the panel is
     * actually there rather than from the drawer's own mount. Contents that already took it, mounting
     * first, keep it. */
    const attach = useCallback((node: HTMLDialogElement | null) => {
        if (node && !panel.current && !node.contains(document.activeElement)) {
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
            <dialog
                ref={attach}
                open
                className={[styles.drawer, size === 'wide' && styles.wide, width !== null && styles.resized].filter(Boolean).join(' ')}
                style={width === null ? undefined : ({ '--drawer-width': `${width}px` } as CSSProperties)}
                data-dragging={dragging || undefined}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
            >
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
                    {actions}
                    <Button small secondary icon={<IconCross16 />} aria-label="Close" title="Close" onClick={onClose} />
                </header>
                {tabs && <div className={styles.tabs}>{tabs}</div>}
                <div className={styles.body}>{children}</div>
                {/* Last in the tab order, after the drawer's own controls, though it sits on the left edge */}
                <hr
                    aria-orientation="vertical"
                    aria-label="Resize drawer"
                    aria-valuemin={minWidth(size)}
                    aria-valuemax={maxWidth(size)}
                    aria-valuenow={current}
                    aria-valuetext={`${current} pixels wide`}
                    title="Drag to resize, double-click to reset"
                    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a focusable separator is a window splitter, which is interactive
                    tabIndex={0}
                    className={styles.resizer}
                    onPointerDown={startDrag}
                    onDoubleClick={() => setWidth(null)}
                    onKeyDown={resizeByKey}
                />
            </dialog>
        </Layer>
    )
}
