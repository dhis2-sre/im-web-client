import { FC, ReactNode } from 'react'
import styles from './heading.module.css'
import { PageHeader } from './page/page.tsx'

/* The header of a screen not yet built on Page. It is PageHeader with the spacing Page gives it, so a
 * title sits at the same size and in the same place on every screen and nothing jumps between them. */
export const Heading: FC<{ title: string; children?: ReactNode }> = ({ title, children }) => (
    <div className={styles.heading}>
        <PageHeader title={title} actions={children} />
    </div>
)
