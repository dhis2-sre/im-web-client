import { NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'

/* Shown wherever the browser copies settings: reads mask every sensitive value, so a copy can't carry them. */
export const CopyNotice: FC<{ source: string; target: 'preset' | 'instances'; onForm?: boolean; className?: string }> = ({ source, target, onForm, className }) => (
    <NoticeBox className={className} title="Passwords and keys aren't copied">
        Passwords, keys and the custom dhis.conf of <strong>{source}</strong> can&apos;t be copied, so {target === 'preset' ? 'the preset starts with' : 'these instances get'} the
        stack defaults.{onForm && ' Enter any you need below.'}
    </NoticeBox>
)
