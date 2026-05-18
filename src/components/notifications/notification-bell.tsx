import { useAlert } from '@dhis2/app-service-alerts'
import { type FC, useCallback, useEffect, useState } from 'react'
import { useNotifications } from '../../hooks/use-notifications.ts'
import styles from './notification-bell.module.css'
import { NotificationPanel } from './notification-panel.tsx'

const BellIcon: FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
)

export const NotificationBell: FC = () => {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, lastSseEvent, markRead, markAllRead } = useNotifications()

    const { show: showSuccess } = useAlert(({ message }: { message: string }) => message, { success: true })
    const { show: showError } = useAlert(({ message }: { message: string }) => message, { critical: true })

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
                <BellIcon />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {open && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} />}
        </div>
    )
}
