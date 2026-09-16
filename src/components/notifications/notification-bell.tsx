import { useAlert } from '@dhis2/app-service-alerts'
import { IconSubscribe24 } from '@dhis2/ui'
import { type FC, useCallback, useEffect, useState } from 'react'
import { useNotificationsContext } from '../../hooks/use-notifications-context.ts'
import styles from './notification-bell.module.css'
import { NotificationPanel } from './notification-panel.tsx'

/* useAlert memoises show on its message and options arguments, so these have to keep their identity
 * across renders. Declared inline they were new objects every render, which gave show a new identity
 * every render and re-ran the effect below, re-showing the last event's alert on any re-render. */
const alertMessage = ({ message }: { message: string }) => message
const SUCCESS_OPTIONS = { success: true }
const CRITICAL_OPTIONS = { critical: true }

export const NotificationBell: FC = () => {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, lastSseEvent, markRead, markAllRead } = useNotificationsContext()

    const { show: showSuccess } = useAlert(alertMessage, SUCCESS_OPTIONS)
    const { show: showError } = useAlert(alertMessage, CRITICAL_OPTIONS)

    useEffect(() => {
        if (!lastSseEvent) {
            return
        }
        const { kind, data } = lastSseEvent
        const label = kind === 'filestore-backup' ? 'Filestore backup' : 'Database save'
        if (data.status === 'success') {
            showSuccess({ message: `${label} for "${data.databaseName}" succeeded` })
        } else if (data.status === 'error') {
            showError({ message: `${label} for "${data.databaseName}" failed` })
        }
    }, [lastSseEvent, showSuccess, showError])

    const toggle = useCallback(() => setOpen((v) => !v), [])
    const close = useCallback(() => setOpen(false), [])

    const handleMarkRead = useCallback(
        async (id: number) => {
            await markRead(id)
        },
        [markRead]
    )

    const handleMarkAllRead = useCallback(async () => {
        await markAllRead()
    }, [markAllRead])

    return (
        <div className={styles.wrapper}>
            {open && <div className={styles.overlay} onClick={close} />}
            <button className={`${styles.button} ${open ? styles.active : ''}`} onClick={toggle} aria-label="Notifications">
                <IconSubscribe24 />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {open && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} />}
        </div>
    )
}
