import { NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'

/* Shown when the browser copies a preset into a new one: reads mask every sensitive value, so the copy can't carry them. */
export const CopyNotice: FC<{ source: string; className?: string }> = ({ source, className }) => (
    <NoticeBox className={className} title="Passwords and keys aren't copied">
        Passwords, keys and the custom dhis.conf of <strong>{source}</strong> can&apos;t be copied, so the preset starts with the stack defaults. Enter any you need.
    </NoticeBox>
)
