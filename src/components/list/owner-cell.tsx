import type { FC } from 'react'
import { useAuth } from '../../hooks/index.ts'
import styles from './list-page.module.css'

/* An email has nowhere to wrap, so in a list it claimed the width and pushed names onto two lines. It
 * is clipped to one line instead, the whole address on hover, and the signed-in user's own reads "You". */
export const OwnerCell: FC<{ owner?: { id?: number; email?: string } }> = ({ owner }) => {
    const { currentUser } = useAuth()
    if (!owner?.email) {
        return null
    }
    return (
        <span className={styles.clip} title={owner.email}>
            {owner.id !== undefined && owner.id === currentUser?.id ? 'You' : owner.email}
        </span>
    )
}
