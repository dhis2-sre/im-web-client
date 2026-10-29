import { IconCheckmark16 } from '@dhis2/ui'
import { type FC, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Notification } from '../../hooks/use-notifications.ts'
import { MomentFromNow } from '../moment-from-now.tsx'
import { StatusDot } from '../status/status-dot.tsx'
import type { Status as DotStatus } from '../status/statuses.ts'
import styles from './notification-panel.module.css'

type Status = 'started' | 'success' | 'error'

type NotificationData = {
    status: Status
    error?: string
    databaseId?: number
    databaseName?: string
    deploymentId?: number
    deploymentName?: string
}

const DOTS: Record<Status, DotStatus> = {
    started: { label: 'In progress', tone: 'progress' },
    success: { label: 'Succeeded', tone: 'positive' },
    error: { label: 'Failed', tone: 'negative' },
}

/* Deploy, edit and reset all publish the same "deployment" event, so the wording can only say how it ended. */
const OUTCOMES: Record<string, Record<Status, string>> = {
    'database-save': { started: 'Saving database', success: 'Database saved', error: 'Database save failed' },
    'filestore-backup': { started: 'Backing up filestore', success: 'Filestore backed up', error: 'Filestore backup failed' },
    'deployment': { started: 'Deploying', success: 'Deployed', error: 'Deploy failed' },
}

const summarise = (kind: string, data: NotificationData) => {
    const outcome = OUTCOMES[kind]?.[data.status] ?? kind
    if (kind === 'deployment') {
        return { title: `${outcome}: ${data.deploymentName}`, to: `/instances/${data.deploymentId}/details` }
    }
    return {
        title: `${outcome}: ${data.databaseName}`,
        to: `/databases/${data.databaseId}`,
    }
}

/* @dhis2/ui has no double checkmark, so this is Lucide's check-check (ISC licence). */
const DoubleCheckmark16: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 7 17l-5-5" />
        <path d="m22 10-7.5 7.5L13 16" />
    </svg>
)

type NotificationItemProps = {
    notification: Notification
    onMarkRead: (id: number) => void
    onNavigate: () => void
}

const NotificationItem: FC<NotificationItemProps> = ({ notification, onMarkRead, onNavigate }) => {
    const [errorExpanded, setErrorExpanded] = useState(false)
    let data: NotificationData
    try {
        data = JSON.parse(notification.data)
    } catch {
        return null
    }
    const { title, to } = summarise(notification.kind, data)

    return (
        <li className={styles.item}>
            {/* The dot sits in a box one title line tall, so it centres on the first line however the title wraps. */}
            <span className={styles.dot}>
                <StatusDot status={DOTS[data.status] ?? { label: data.status, tone: 'neutral' }} />
            </span>
            <div className={styles.content}>
                <Link className={styles.link} to={to} onClick={onNavigate}>
                    {title}
                </Link>
                {data.error && (
                    <button
                        className={`${styles.error} ${errorExpanded ? styles.errorExpanded : ''}`}
                        onClick={() => setErrorExpanded((v) => !v)}
                        aria-expanded={errorExpanded}
                        title={errorExpanded ? undefined : 'Show full error'}
                    >
                        {data.error}
                    </button>
                )}
                <span className={styles.meta}>
                    <MomentFromNow date={notification.createdAt} />
                </span>
            </div>
            <button className={styles.markRead} onClick={() => onMarkRead(notification.id)} aria-label={`Mark "${title}" as read`} title="Mark as read">
                <IconCheckmark16 />
            </button>
        </li>
    )
}

type NotificationPanelProps = {
    notifications: Notification[]
    onMarkRead: (id: number) => void
    onMarkAllRead: () => void
    onNavigate: () => void
}

export const NotificationPanel: FC<NotificationPanelProps> = ({ notifications, onMarkRead, onMarkAllRead, onNavigate }) => (
    <section className={styles.panel} aria-label="Notifications">
        {/* The header scrolls with the list, pinned to its top, so it shares the scrollbar's width and its button lines up with the rows'. */}
        <div className={styles.list}>
            <div className={styles.header}>
                <p className={styles.title}>Notifications</p>
                {notifications.length > 0 && (
                    <button className={styles.markRead} onClick={onMarkAllRead} aria-label="Mark all as read" title="Mark all as read">
                        <DoubleCheckmark16 />
                    </button>
                )}
            </div>
            {notifications.length === 0 ? (
                <div className={styles.empty}>No notifications</div>
            ) : (
                <ul className={styles.items}>
                    {notifications.map((n) => (
                        <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} onNavigate={onNavigate} />
                    ))}
                </ul>
            )}
        </div>
    </section>
)
