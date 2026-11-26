import { useAlert } from '@dhis2/app-service-alerts'
import { useMemo } from 'react'

type ActionAlert = { message: string; critical: boolean }

// Module-level, so the alert's show function keeps its identity between renders.
const alertMessage = ({ message }: ActionAlert) => message
const alertOptions = ({ critical }: ActionAlert) => (critical ? { critical: true } : { success: true })

/* The toast that reports how an action went: green when it was done, red when it was not. */
export const useActionAlert = () => {
    const { show } = useAlert(alertMessage, alertOptions)

    return useMemo(
        () => ({
            success: (message: string) => show({ message, critical: false }),
            error: (message: string) => show({ message, critical: true }),
        }),
        [show]
    )
}
