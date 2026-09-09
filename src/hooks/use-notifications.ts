import { useCallback, useEffect, useRef, useState } from 'react'
import { ComponentStatusEventData } from '../types/index.ts'
import { baseURL, refreshTokens, useAuthAxios } from './use-auth-axios.ts'

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

/* Transient component-status events never become notifications; seq makes every event a fresh
 * object so effects fire even when consecutive payloads are identical. */
export type ComponentStatusEvent = {
    seq: number
    data: ComponentStatusEventData
}

export type SseEvent = {
    kind: NotificationKind
    data: DatabaseSaveData
}

const STREAM_RECONNECT_DELAY_MS = 3_000
const STREAM_RECONNECT_MAX_DELAY_MS = 30_000

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [lastSseEvent, setLastSseEvent] = useState<SseEvent | null>(null)
    const [lastComponentStatus, setLastComponentStatus] = useState<ComponentStatusEvent | null>(null)
    /* Counts the times the event stream has come up. Consumers watch it to reload what they cannot
     * have been told about while it was down. */
    const [streamEpoch, setStreamEpoch] = useState(0)
    const componentStatusSeq = useRef(0)

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
        let unmounted = false
        let source: EventSource | null = null
        let reconnect: ReturnType<typeof setTimeout> | undefined
        let delay = STREAM_RECONNECT_DELAY_MS

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

        const connect = () => {
            const es = new EventSource(`${baseURL}/events`, { withCredentials: true })
            source = es

            es.onopen = () => {
                delay = STREAM_RECONNECT_DELAY_MS
                /* Anything that happened while the stream was down was never pushed, so consumers
                 * reload rather than carry on from a view that stopped being live. */
                setStreamEpoch((current) => current + 1)
                refreshRef.current()
            }

            /* EventSource reconnects on its own when an established stream drops, but an HTTP error
             * response closes it for good. The access token lives five minutes while a connection
             * lives much longer, so a reconnect regularly meets an expired cookie and gets a 401,
             * which would silently end live updates until the page is reloaded. Refresh the session
             * and dial back in, backing off so a genuinely dead session does not spin. */
            es.onerror = () => {
                if (unmounted || es.readyState !== EventSource.CLOSED) {
                    return
                }
                es.close()
                const wait = delay
                delay = Math.min(delay * 2, STREAM_RECONNECT_MAX_DELAY_MS)
                reconnect = setTimeout(() => {
                    if (unmounted) {
                        return
                    }
                    refreshTokens()
                        .catch((err) => console.error('[notifications] failed to refresh the session before reconnecting', err))
                        .then(() => {
                            if (!unmounted) {
                                connect()
                            }
                        })
                }, wait)
            }

            es.addEventListener('database-save', makeHandler('database-save'))
            es.addEventListener('filestore-backup', makeHandler('filestore-backup'))
            es.addEventListener('component-status', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as ComponentStatusEventData
                    componentStatusSeq.current += 1
                    setLastComponentStatus({ seq: componentStatusSeq.current, data })
                } catch (err) {
                    console.error('[notifications] failed to parse component-status event', { raw: e.data, err })
                }
            })
        }

        connect()
        return () => {
            unmounted = true
            clearTimeout(reconnect)
            source?.close()
        }
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

    return { notifications, unreadCount, lastSseEvent, lastComponentStatus, streamEpoch, markRead, markAllRead }
}
