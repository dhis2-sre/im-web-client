import { useAlert } from '@dhis2/app-service-alerts'
import { IconChevronDown16, IconLogOut16 } from '@dhis2/ui'
import { type FC, useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/index.ts'
import { IDENTICON_SIZE, identicon } from './identicon.ts'
import styles from './user-menu.module.css'

const Identicon: FC<{ email: string }> = ({ email }) => {
    const { dots, color } = identicon(email)
    return (
        <svg className={styles.avatar} viewBox={`0 0 ${IDENTICON_SIZE} ${IDENTICON_SIZE}`} aria-hidden="true">
            {dots.map(({ x, y, lit }) => (
                <circle key={`${x},${y}`} cx={x + 0.5} cy={y + 0.5} r="0.34" fill={lit ? color : 'rgba(255, 255, 255, 0.2)'} />
            ))}
        </svg>
    )
}

/* useAlert memoises show on these arguments, so they keep their identity across renders. */
const logoutErrorMessage = ({ message }: { message: string }) => `Could not log out: ${message}`
const CRITICAL_OPTIONS = { critical: true }

/* A user is only an email and a login here, so the account row holds nothing but the way out. */
export const UserMenu: FC<{ email: string }> = ({ email }) => {
    const { logout } = useAuth()
    const { show: showError } = useAlert(logoutErrorMessage, CRITICAL_OPTIONS)
    const [open, setOpen] = useState(false)
    const wrapper = useRef<HTMLDivElement>(null)
    const trigger = useRef<HTMLButtonElement>(null)
    const firstItem = useRef<HTMLButtonElement>(null)

    /* Closes on Escape, on a press anywhere else and when focus moves elsewhere. Listening on the document
     * rather than covering the page means the press that closes the menu still reaches what it was aimed at. */
    useEffect(() => {
        if (!open) {
            return
        }
        firstItem.current?.focus()
        const isOutside = (target: EventTarget | null) => !wrapper.current?.contains(target as Node)
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false)
                trigger.current?.focus()
            }
        }
        const onPointerDown = (e: PointerEvent) => isOutside(e.target) && setOpen(false)
        const onFocusIn = (e: FocusEvent) => isOutside(e.target) && setOpen(false)
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('focusin', onFocusIn)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('focusin', onFocusIn)
        }
    }, [open])

    const onLogout = useCallback(async () => {
        try {
            await logout()
        } catch (error) {
            console.error(error)
            const message = error?.response?.data ?? error?.message ?? 'Logout error: could not log out'
            showError({ message })
        }
    }, [logout, showError])

    return (
        <div ref={wrapper} className={styles.wrapper}>
            <button ref={trigger} className={styles.trigger} aria-haspopup="menu" aria-expanded={open} title={email} onClick={() => setOpen((v) => !v)}>
                <Identicon email={email} />
                <span className={styles.email}>{email}</span>
                <span className={styles.chevron} aria-hidden="true">
                    <IconChevronDown16 />
                </span>
            </button>
            {open && (
                <div className={styles.menu} role="menu" aria-label="Account">
                    <button ref={firstItem} className={styles.item} role="menuitem" onClick={onLogout}>
                        <IconLogOut16 />
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
