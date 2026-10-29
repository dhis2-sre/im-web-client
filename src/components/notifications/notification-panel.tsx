import { IconCheckmark16 } from '@dhis2/ui'
import { type FC, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthAxios } from '../../hooks/use-auth-axios.ts'
import type { GroupsWithDatabases, GroupWithDeployments } from '../../types/index.ts'
import type { NotificationEvent } from '../../utils/visible-notifications.ts'
import { MomentFromNow } from '../moment-from-now.tsx'
import { StatusDot } from '../status/status-dot.tsx'
import type { Status } from '../status/statuses.ts'
import styles from './notification-panel.module.css'

type EventStatus = NotificationEvent['data']['status']

const DOTS: Record<EventStatus, Status> = {
    started: { label: 'In progress', tone: 'progress' },
    success: { label: 'Succeeded', tone: 'positive' },
    error: { label: 'Failed', tone: 'negative' },
}

/* Deploy, edit and reset all publish the same "deployment" event, so the wording can only say how it ended. */
const OUTCOMES: Record<NotificationEvent['kind'], Record<EventStatus, string>> = {
    'database-save': { started: 'Saving database', success: 'Database saved', error: 'Database save failed' },
    'filestore-backup': { started: 'Backing up filestore', success: 'Filestore backed up', error: 'Filestore backup failed' },
    'deployment': { started: 'Deploying', success: 'Deployed', error: 'Deploy failed' },
}

/* What the event was about, and where it lives while it still exists. */
const subject = (event: NotificationEvent) =>
    event.kind === 'deployment'
        ? { name: event.data.deploymentName, id: event.data.deploymentId, to: `/instances/${event.data.deploymentId}/details` }
        : { name: event.data.databaseName, id: event.data.databaseId, to: `/databases/${event.data.databaseId}` }

/* @dhis2/ui has no double checkmark, so this is Lucide's check-check (ISC licence). */
const DoubleCheckmark16: FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 7 17l-5-5" />
        <path d="m22 10-7.5 7.5L13 16" />
    </svg>
)

/* The instances and databases the user can still reach, so a row about one that has since been
 * deleted, or is in a group the user has left, is not a link to an error page. Until a list has
 * loaded, or if it fails, its rows stay links. */
const useExists = () => {
    const [{ data: deploymentGroups }] = useAuthAxios<GroupWithDeployments[]>('/deployments', { useCache: false, autoCatch: true })
    const [{ data: databaseGroups }] = useAuthAxios<GroupsWithDatabases[]>('/databases', { useCache: false, autoCatch: true })

    return useMemo(() => {
        const deploymentIds = deploymentGroups && new Set(deploymentGroups.flatMap((group) => group.deployments ?? []).map((deployment) => deployment.id))
        const databaseIds = databaseGroups && new Set(databaseGroups.flatMap((group) => group.databases ?? []).map((database) => database.id))
        return (event: NotificationEvent) => {
            const ids = event.kind === 'deployment' ? deploymentIds : databaseIds
            return !ids || ids.has(subject(event).id)
        }
    }, [deploymentGroups, databaseGroups])
}

type NotificationItemProps = {
    event: NotificationEvent
    linked: boolean
    onMarkRead: (id: number) => void
    onNavigate: () => void
}

const NotificationItem: FC<NotificationItemProps> = ({ event, linked, onMarkRead, onNavigate }) => {
    const [errorExpanded, setErrorExpanded] = useState(false)
    const { notification, data } = event
    const { name, to } = subject(event)
    const title = `${OUTCOMES[event.kind][data.status]}: ${name}`

    return (
        <li className={styles.item}>
            {/* The dot sits in a box one title line tall, so it centres on the first line however the title wraps. */}
            <span className={styles.dot}>
                <StatusDot status={DOTS[data.status] ?? { label: data.status, tone: 'neutral' }} />
            </span>
            <div className={styles.content}>
                {linked ? (
                    <Link className={styles.link} to={to} onClick={onNavigate}>
                        {title}
                    </Link>
                ) : (
                    <span className={styles.titleText}>{title}</span>
                )}
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
    notifications: NotificationEvent[]
    onMarkRead: (id: number) => void
    onMarkAllRead: () => void
    onNavigate: () => void
}

export const NotificationPanel: FC<NotificationPanelProps> = ({ notifications, onMarkRead, onMarkAllRead, onNavigate }) => {
    const exists = useExists()

    return (
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
                        {notifications.map((event) => (
                            <NotificationItem key={event.notification.id} event={event} linked={exists(event)} onMarkRead={onMarkRead} onNavigate={onNavigate} />
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
