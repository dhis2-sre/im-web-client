import type { FC, ReactNode } from 'react'
import type { Lock } from '../../types/index.ts'
import styles from './database-markers.module.css'

/* The instance holding the lock, which is all a menu needs to say why an action is unavailable. A
 * single database comes without its lock's instance loaded, as an empty one, so a blank name counts
 * as none. */
export const lockHolder = (lock: Lock) => `Locked by ${lock.instance?.name || 'an instance'}`

/* The full account, for the column: which instance, in which group, and who locked it. */
export const lockDescription = (lock: Lock) =>
    `${lockHolder(lock)}${lock.instance?.groupName ? ` (${lock.instance.groupName})` : ''}${lock.user?.email ? `, ${lock.user.email}` : ''}`

/* An icon that says something about the row, spelled out on hover and for screen readers. */
const Marker: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
    <span className={styles.marker} title={label}>
        {children}
        <span className="visually-hidden">{label}</span>
    </span>
)

/* Lucide's file-box, a file with a box: the files saved alongside the dump come with it. */
export const FilestoreMarker: FC = () => (
    <Marker label="Database includes a linked filestore">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2v5a1 1 0 001 1h5" />
            <path d="M14.692 22H18a2 2 0 002-2V8a2.4 2.4 0 00-.706-1.706l-3.588-3.588A2.4 2.4 0 0014 2H6a2 2 0 00-2 2v3.804" />
            <path d="M2.264 13.752 7 16.5l4.737-2.748" />
            <path d="M2.995 13.014A2 2 0 002 14.744v3.516a2 2 0 00.996 1.73l3 1.74a2 2 0 002.008 0l3-1.74A2 2 0 0012 18.26v-3.517a2 2 0 00-.995-1.73l-3-1.742a2 2 0 00-1.892-.064z" />
            <path d="M7 16.5V22" />
        </svg>
    </Marker>
)

/* A locked database is reserved for one instance: it can't be deleted or renamed, and only that
 * instance can save over it. */
export const LockMarker: FC<{ lock: Lock }> = ({ lock }) => (
    <Marker label={lockDescription(lock)}>
        {/* Lucide's lock-keyhole. */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="16" r="1" />
            <rect x="3" y="10" width="18" height="12" rx="2" />
            <path d="M7 10V7a5 5 0 0 1 10 0v3" />
        </svg>
    </Marker>
)
