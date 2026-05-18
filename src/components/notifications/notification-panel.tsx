import type { FC } from 'react'
import Moment from 'react-moment'
import type { DatabaseSaveData, Notification } from '../../hooks/use-notifications.ts'
import styles from './notification-panel.module.css'

const formatMessage = (kind: string, data: DatabaseSaveData): string => {
    if (kind === 'database-save') {
        switch (data.status) {
            case 'started':
                return `Saving database "${data.databaseName}"…`
            case 'success':
                return `Database "${data.databaseName}" saved successfully`
            case 'error':
                return `Failed to save database "${data.databaseName}"${data.error ? `: ${data.error}` : ''}`
        }
    }
    if (kind === 'filestore-backup') {
        switch (data.status) {
            case 'started':
                return `Backing up filestore for "${data.databaseName}"…`
            case 'success':
                return `Filestore for "${data.databaseName}" backed up successfully`
            case 'error':
                return `Failed to back up filestore for "${data.databaseName}"${data.error ? `: ${data.error}` : ''}`
        }
    }
    return kind
}

const StatusIcon: FC<{ status: string }> = ({ status }) => {
    const label = status === 'success' ? '✓' : status === 'error' ? '✕' : '…'
    return <span className={`${styles.statusIcon} ${styles[status] ?? styles.started}`}>{label}</span>
}

type NotificationItemProps = {
    notification: Notification
    onMarkRead: (id: number) => void
}

const NotificationItem: FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
    let data: DatabaseSaveData
    try {
        data = JSON.parse(notification.data) as DatabaseSaveData
    } catch {
        return null
    }

    return (
        <div className={`${styles.item} ${notification.read ? '' : styles.unread}`} onClick={() => !notification.read && onMarkRead(notification.id)}>
            <StatusIcon status={data.status} />
            <div className={styles.content}>
                <div className={styles.message}>{formatMessage(notification.kind, data)}</div>
                <div className={styles.time}>
                    <Moment fromNow>{notification.createdAt}</Moment>
                </div>
            </div>
        </div>
    )
}

type NotificationPanelProps = {
    notifications: Notification[]
    unreadCount: number
    onMarkRead: (id: number) => void
    onMarkAllRead: () => void
}

export const NotificationPanel: FC<NotificationPanelProps> = ({ notifications, unreadCount, onMarkRead, onMarkAllRead }) => {
    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <p className={styles.title}>Notifications</p>
                <button className={styles.markAllRead} onClick={onMarkAllRead} disabled={unreadCount === 0}>
                    Mark all as read
                </button>
            </div>
            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.empty}>No notifications yet</div>
                ) : (
                    notifications.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />)
                )}
            </div>
        </div>
    )
}
