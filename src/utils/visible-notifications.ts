import type { DatabaseSaveData, Notification } from '../hooks/use-notifications.ts'

/* shortcut: the server returns every notification ever, so only the newest are shown; page it server-side once it has a limit. */
const MAX_NOTIFICATIONS = 50

/* A save or backup persists its "started" row and then a separate outcome row. Once the outcome has
 * arrived the started row is noise, so drop any started row with a newer row for the same database,
 * even a read one. The panel lists only unread rows, so read ones are dropped too.
 * Expects newest first, as the server sends them. */
export const visibleNotifications = (notifications: Notification[]): Notification[] => {
    const settled = new Set<string>()
    return notifications
        .filter((n) => {
            let data: Partial<DatabaseSaveData>
            try {
                data = JSON.parse(n.data)
            } catch {
                return false
            }
            if (data.databaseId === undefined) {
                return true
            }
            const key = `${n.kind}:${data.databaseId}`
            const superseded = data.status === 'started' && settled.has(key)
            settled.add(key)
            return !superseded
        })
        .filter((n) => !n.read)
        .slice(0, MAX_NOTIFICATIONS)
}
