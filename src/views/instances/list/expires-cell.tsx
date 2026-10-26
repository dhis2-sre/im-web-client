import { useState } from 'react'
import type { FC } from 'react'
import { MomentExpiresFromNow } from '../../../components/index.ts'
import { useAuth } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import { DAY_IN_SECONDS } from '../fields/ttl-presets.ts'
import styles from './expires-cell.module.css'

const EXPIRING_SOON_SECONDS = DAY_IN_SECONDS

/* Flags the viewer's own instances in their last day. The dot is there so the warning doesn't rest on
 * colour alone. */
export const ExpiresCell: FC<{ deployment: Deployment }> = ({ deployment }) => {
    const { currentUser } = useAuth()
    // shortcut: the clock is read once when the cell mounts, so a list left open doesn't turn amber until it remounts; tick it if that matters.
    const [now] = useState(Date.now)
    const expiresAt = new Date(deployment.createdAt).getTime() + deployment.ttl * 1000
    const remaining = (expiresAt - now) / 1000
    const soon = deployment.user.id === currentUser?.id && remaining > 0 && remaining < EXPIRING_SOON_SECONDS

    return (
        <span className={soon ? styles.expiringSoon : undefined} title={new Date(expiresAt).toLocaleString()}>
            <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
            {soon && (
                <>
                    <span className={styles.dot} aria-hidden="true" />
                    <span className={styles.visuallyHidden}>(expiring soon)</span>
                </>
            )}
        </span>
    )
}
