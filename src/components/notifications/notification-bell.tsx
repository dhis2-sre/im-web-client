import { useAlert } from '@dhis2/app-service-alerts'
import { IconSubscribe24 } from '@dhis2/ui'
import { type FC, useCallback, useEffect, useState } from 'react'
import { useNotifications } from '../../hooks/use-notifications.ts'
import styles from './notification-bell.module.css'
import { NotificationPanel } from './notification-panel.tsx'

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
                <IconSubscribe24 />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {open && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} />}
        </div>
    )
}
