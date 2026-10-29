import type { Notification } from '../hooks/use-notifications.ts'
import { visibleNotifications } from './visible-notifications.ts'

const notification = (id: number, kind: string, data: object): Notification => ({
    id,
    createdAt: '2026-10-29T10:00:00Z',
    userId: 1,
    groupName: 'play',
    kind,
    data: JSON.stringify(data),
    read: false,
})

describe('visibleNotifications', () => {
    it('drops a started row once a newer row for the same database exists, and keeps a lone one', () => {
        const rows = [
            notification(4, 'database-save', { status: 'success', databaseId: 1 }),
            notification(3, 'database-save', { status: 'started', databaseId: 2 }),
            notification(2, 'filestore-backup', { status: 'started', databaseId: 1 }),
            notification(1, 'database-save', { status: 'started', databaseId: 1 }),
        ]
        expect(visibleNotifications(rows).map((event) => event.notification.id)).toEqual([4, 3, 2])
    })

    it('drops read rows, and keeps a started row hidden once its outcome is read', () => {
        const rows = [
            { ...notification(3, 'database-save', { status: 'success', databaseId: 1 }), read: true },
            notification(2, 'database-save', { status: 'started', databaseId: 1 }),
            { ...notification(1, 'deployment', { status: 'error', deploymentId: 7 }), read: true },
        ]
        expect(visibleNotifications(rows)).toEqual([])
    })

    it('drops rows marked read in this session even when the server still sends them unread', () => {
        const rows = [
            notification(4, 'deployment', { status: 'success', deploymentId: 9 }),
            notification(3, 'deployment', { status: 'error', deploymentId: 8 }),
            notification(2, 'deployment', { status: 'success', deploymentId: 7 }),
            notification(1, 'deployment', { status: 'success', deploymentId: 6 }),
        ]
        expect(visibleNotifications(rows, [3], 2).map((event) => event.notification.id)).toEqual([4])
    })

    it('keeps deployments and drops rows it cannot parse or does not know', () => {
        const rows = [
            notification(3, 'database-copy', { status: 'success', databaseId: 1 }),
            notification(2, 'deployment', { status: 'success', deploymentId: 7 }),
            { ...notification(1, 'database-save', {}), data: 'not json' },
        ]
        expect(visibleNotifications(rows).map((event) => event.notification.id)).toEqual([2])
    })
})
