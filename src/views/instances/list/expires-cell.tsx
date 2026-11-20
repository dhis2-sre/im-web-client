import { useState } from 'react'
import type { FC } from 'react'
import { MomentExpiresFromNow } from '../../../components/index.ts'
import { useAuth } from '../../../hooks/index.ts'
import type { Deployment } from '../../../types/index.ts'
import styles from './expires-cell.module.css'
import { isExpiringSoon } from './instance-filter-rules.ts'

/* Flags the viewer's own instances in their last day. The dot is there so the warning doesn't rest on
 * colour alone. A prefix, such as the details page's "Expires", is flagged along with the time. */
export const ExpiresCell: FC<{ deployment: Deployment; prefix?: string }> = ({ deployment, prefix }) => {
    const { currentUser } = useAuth()
    // shortcut: the clock is read once when the cell mounts, so a list left open doesn't turn amber until it remounts; tick it if that matters.
    const [now] = useState(Date.now)
    const soon = deployment.user.id === currentUser?.id && isExpiringSoon(deployment, now)

    return (
        <span className={soon ? styles.expiringSoon : undefined}>
            {prefix && `${prefix} `}
            <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
            {soon && (
                <>
                    <span className={styles.dot} aria-hidden="true" />
                    <span className="visually-hidden">(expiring soon)</span>
                </>
            )}
        </span>
    )
}
