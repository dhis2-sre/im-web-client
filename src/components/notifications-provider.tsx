import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { NotificationsContext } from '../contexts/notifications-context.ts'
import { useNotifications } from '../hooks/use-notifications.ts'

/* Owns the single EventSource connection; everything below shares it through the context instead
 * of opening one connection per consumer. */
export const NotificationsProvider: FC = () => {
    const notifications = useNotifications()
    return (
        <NotificationsContext.Provider value={notifications}>
            <Outlet />
        </NotificationsContext.Provider>
    )
}
