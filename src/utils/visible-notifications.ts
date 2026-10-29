import type { DatabaseSaveData, Notification, NotificationKind } from '../hooks/use-notifications.ts'
import type { DeploymentEventData } from '../types/index.ts'

/* A notification with its data parsed into the event it carries. */
export type NotificationEvent =
    | { notification: Notification; kind: 'deployment'; data: DeploymentEventData }
    | { notification: Notification; kind: NotificationKind; data: DatabaseSaveData }

/* Kinds the panel does not know are left out, since it could neither word them nor say where they lead. */
const parse = (notification: Notification): NotificationEvent[] => {
    let data
    try {
        data = JSON.parse(notification.data)
    } catch {
        return []
    }
    if (notification.kind === 'deployment') {
        return [{ notification, kind: notification.kind, data }]
    }
    if (notification.kind === 'database-save' || notification.kind === 'filestore-backup') {
        return [{ notification, kind: notification.kind, data }]
    }
    return []
}

/* A save or backup persists its "started" row and then a separate outcome row. Once the outcome has
 * arrived the started row is noise, so drop any started row with a newer row for the same database,
 * even a read one. The panel lists only unread rows, so read ones are dropped too, along with the
 * ones this session has marked read: by id, or up to the newest id "mark all" saw.
 * Expects newest first, as the server sends them. */
export const visibleNotifications = (notifications: Notification[], readIds: number[] = [], readUpTo = 0): NotificationEvent[] => {
    const settled = new Set<string>()
    return notifications
        .flatMap(parse)
        .filter((event) => {
            if (event.kind === 'deployment') {
                return true
            }
            const key = `${event.kind}:${event.data.databaseId}`
            const superseded = event.data.status === 'started' && settled.has(key)
            settled.add(key)
            return !superseded
        })
        .filter(({ notification: n }) => !n.read && n.id > readUpTo && !readIds.includes(n.id))
}
