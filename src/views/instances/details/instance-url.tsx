import { IconCheckmark16, IconCopy16, IconLaunch16 } from '@dhis2/ui'
import { useEffect, useState } from 'react'
import type { FC } from 'react'
import styles from './instance-url.module.css'

/* An address to copy or open: the address, a link itself, followed by quiet icons for copying it
 * and opening it in a new tab. It is cut short with an ellipsis rather than wrapping; the copy
 * and the tooltip keep it whole. */
export const InstanceUrl: FC<{ url: string }> = ({ url }) => {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!copied) {
            return
        }
        const timeout = setTimeout(() => setCopied(false), 1500)
        return () => clearTimeout(timeout)
    }, [copied])

    // shortcut: a refused clipboard (no permission, insecure origin) just leaves the icon unchanged
    const copy = () =>
        navigator.clipboard.writeText(url).then(
            () => setCopied(true),
            () => undefined
        )

    return (
        <span className={styles.url}>
            <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer" title={url}>
                {url.replace(/^https:\/\//, '')}
            </a>
            <button
                type="button"
                className={`${styles.icon} ${copied ? styles.copied : ''}`}
                aria-label={copied ? 'Copied' : 'Copy URL'}
                title={copied ? 'Copied' : 'Copy URL'}
                onClick={copy}
            >
                {copied ? <IconCheckmark16 /> : <IconCopy16 />}
            </button>
            <a className={styles.icon} href={url} target="_blank" rel="noopener noreferrer" aria-label="Open in a new tab" title="Open in a new tab">
                <IconLaunch16 />
            </a>
        </span>
    )
}
