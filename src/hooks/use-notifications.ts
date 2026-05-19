import { useCallback, useEffect, useRef, useState } from 'react'
import { baseURL, useAuthAxios } from './use-auth-axios.ts'

export type DatabaseSaveData = {
    status: 'started' | 'success' | 'error'
    databaseId: number
    databaseName: string
    size?: number
    error?: string
}

export type Notification = {
    id: number
    createdAt: string
    userId: number
    groupName: string
    kind: string
    data: string
    read: boolean
}

export type NotificationKind = 'database-save' | 'filestore-backup'

export type SseEvent = {
    kind: NotificationKind
    data: DatabaseSaveData
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [lastSseEvent, setLastSseEvent] = useState<SseEvent | null>(null)

    const [, fetchNotifications] = useAuthAxios<Notification[]>('/notifications', { manual: true, autoCatch: true })
    const [, executeMarkRead] = useAuthAxios({ method: 'PUT', url: '' }, { manual: true })
    const [, executeMarkAllRead] = useAuthAxios({ method: 'PUT', url: '/notifications/read-all' }, { manual: true })

    const refresh = useCallback(async () => {
        const response = await fetchNotifications()
        if (response?.data) {
            setNotifications(response.data)
        }
    }, [fetchNotifications])

    const refreshRef = useRef(refresh)
    useEffect(() => {
        refreshRef.current = refresh
    }, [refresh])

    useEffect(() => {
        refresh()
    }, [refresh])

    useEffect(() => {
        const es = new EventSource(`${baseURL}/events`, { withCredentials: true })

        const makeHandler = (kind: NotificationKind) => (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data) as DatabaseSaveData
                setLastSseEvent({ kind, data })
                if (data.status !== 'started') {
                    refreshRef.current()
                }
            } catch (err) {
                console.error(`[notifications] failed to parse ${kind} event`, { raw: e.data, err })
            }
        }

        es.onerror = (err) => console.error('[notifications] EventSource error', err)
        es.onopen = () => refreshRef.current()

        es.addEventListener('database-save', makeHandler('database-save'))
        es.addEventListener('filestore-backup', makeHandler('filestore-backup'))
        return () => es.close()
    }, [])

    const markRead = useCallback(
        async (id: number) => {
            await executeMarkRead({ url: `/notifications/${id}/read` })
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        },
        [executeMarkRead]
    )

    const markAllRead = useCallback(async () => {
        await executeMarkAllRead()
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }, [executeMarkAllRead])

    const unreadCount = notifications.filter((n) => !n.read).length

    return { notifications, unreadCount, lastSseEvent, markRead, markAllRead }
}
