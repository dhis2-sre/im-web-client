import { createContext } from 'react'
import { useNotifications } from '../hooks/use-notifications.ts'

export type NotificationsContextApi = ReturnType<typeof useNotifications>

export const NotificationsContext = createContext<NotificationsContextApi | null>(null)
