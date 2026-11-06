import { useAlert } from '@dhis2/app-service-alerts'
import { IconSubscribe16 } from '@dhis2/ui'
import { type FC, useCallback, useEffect, useState } from 'react'
import { useNotificationsContext } from '../../hooks/use-notifications-context.ts'
import styles from './notification-bell.module.css'
import { NotificationPanel } from './notification-panel.tsx'

/* useAlert memoises show on its message and options arguments, so these have to keep their identity
 * across renders. Declared inline they would give show a new identity every render and resubscribe
 * the effect below on every render. */
const alertMessage = ({ message }: { message: string }) => message
const SUCCESS_OPTIONS = { success: true }
const CRITICAL_OPTIONS = { critical: true }

export const NotificationBell: FC = () => {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, onSseEvent, markRead, markAllRead } = useNotificationsContext()

    const { show: showSuccess } = useAlert(alertMessage, SUCCESS_OPTIONS)
    const { show: showError } = useAlert(alertMessage, CRITICAL_OPTIONS)

    useEffect(
        () =>
            onSseEvent(({ kind, data }) => {
                const filestore = kind === 'filestore-backup'
                if (data.status === 'success') {
                    showSuccess({ message: `${filestore ? 'Filestore backed up' : 'Database saved'}: ${data.databaseName}` })
                } else if (data.status === 'error') {
                    showError({ message: `Couldn't ${filestore ? 'back up filestore' : 'save database'} ${data.databaseName}` })
                }
            }),
        [onSseEvent, showSuccess, showError]
    )

    const toggle = useCallback(() => setOpen((v) => !v), [])
    const close = useCallback(() => setOpen(false), [])

    /* A failed mark-read puts the row back, so say why rather than leave the click looking ignored. */
    const handleMarkRead = useCallback((id: number) => markRead(id).catch(() => showError({ message: "Couldn't mark notification as read" })), [markRead, showError])
    const handleMarkAllRead = useCallback(() => markAllRead().catch(() => showError({ message: "Couldn't mark notifications as read" })), [markAllRead, showError])

    return (
        <div className={styles.wrapper}>
            {open && <div className={styles.overlay} onClick={close} />}
            <button
                className={`${styles.button} ${open ? styles.active : ''}`}
                onClick={toggle}
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            >
                <IconSubscribe16 />
                {unreadCount > 0 && <span className={styles.badge} />}
            </button>
            {open && <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} onNavigate={close} />}
        </div>
    )
}
