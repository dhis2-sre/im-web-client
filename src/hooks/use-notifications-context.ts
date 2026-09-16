import { useContext } from 'react'
import { NotificationsContext } from '../contexts/notifications-context.ts'

export const useNotificationsContext = () => {
    const ctx = useContext(NotificationsContext)
    if (!ctx) {
        throw new Error('`useNotificationsContext` must be used within a `NotificationsProvider`.')
    }
    return ctx
}
