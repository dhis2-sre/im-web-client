import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ComponentStatusEventData, DeploymentEventData } from '../types/index.ts'
import { visibleNotifications } from '../utils/visible-notifications.ts'
import { createEmitter } from './create-emitter.ts'
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

export type SseEvent = {
    kind: NotificationKind
    data: DatabaseSaveData
}

const STREAM_RECONNECT_DELAY_MS = 3_000
const STREAM_RECONNECT_MAX_DELAY_MS = 30_000

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    /* Stream events go to subscribers as they arrive rather than into state, where a burst landing
     * before the next render would keep only its last event. Component status and deploy progress
     * are transient and never become notifications. */
    const [sseEvents] = useState(() => createEmitter<SseEvent>())
    const [componentStatuses] = useState(() => createEmitter<ComponentStatusEventData>())
    const [deploymentEvents] = useState(() => createEmitter<DeploymentEventData>())
    /* Counts the times the event stream has come up without picking up where it left off. Consumers
     * watch it to reload what they cannot have been told about while it was down. */
    const [streamEpoch, setStreamEpoch] = useState(0)

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
                sseEvents.emit({ kind, data })
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

            /* When an established stream drops, the browser dials back in with the id of the last
             * event it saw and the server replays everything since, so nothing is missed. A new
             * EventSource, or one that never saw an event, starts from now instead. */
            let resumable = false
            const noteId = (e: MessageEvent) => {
                resumable ||= e.lastEventId !== ''
            }
            for (const kind of ['database-save', 'filestore-backup', 'deployment', 'component-status']) {
                es.addEventListener(kind, noteId)
            }

            es.onopen = () => {
                delay = STREAM_RECONNECT_DELAY_MS
                if (resumable) {
                    return
                }
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
            es.addEventListener('deployment', (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as DeploymentEventData
                    deploymentEvents.emit(data)
                    /* Only the deploy's outcome is persisted, and it is the one the bell shows. */
                    if (!data.instanceId) {
                        refreshRef.current()
                    }
                } catch (err) {
                    console.error('[notifications] failed to parse deployment event', { raw: e.data, err })
                }
            })

            es.addEventListener('component-status', (e: MessageEvent) => {
                try {
                    componentStatuses.emit(JSON.parse(e.data) as ComponentStatusEventData)
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
    }, [sseEvents, componentStatuses, deploymentEvents])

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

    const visible = useMemo(() => visibleNotifications(notifications), [notifications])
    const unreadCount = visible.length

    return {
        notifications: visible,
        unreadCount,
        onSseEvent: sseEvents.subscribe,
        onComponentStatus: componentStatuses.subscribe,
        onDeploymentEvent: deploymentEvents.subscribe,
        streamEpoch,
        markRead,
        markAllRead,
    }
}
