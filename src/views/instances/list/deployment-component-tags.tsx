import { Popover } from '@dhis2/ui'
import { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { replicaStatus, ToneIcon } from '../../../components/index.ts'
import type { Status, StatusTone } from '../../../components/index.ts'
import { DeploymentInstanceComponents } from '../../../types/index.ts'
import styles from './deployment-component-tags.module.css'

/* The label carries the stack because the row flattens every instance of the deployment, where a bare
 * component name is ambiguous: a dhis2-v2 instance alongside a chap one has two components called db.
 * DHIS 2 is the default a deployment is built around, so its components stay bare and only what is
 * deployed alongside them is qualified. A component named after its own stack, like pgadmin, is
 * unambiguous already. The details page needs no prefix at all, having a section per instance. */
const componentLabel = (stackName: string, componentName: string) =>
    stackName.startsWith('dhis2') || componentName === stackName ? componentName : `${stackName}:${componentName}`

type Entry = { key: string; label: string; status: Status }

const SUMMARY_TONES: StatusTone[] = ['positive', 'negative', 'neutral']
const TONE_WORDS: Record<StatusTone, string> = { positive: 'running', negative: 'failed', neutral: 'pending', progress: 'deploying' }

/* One entry per replica, so one unhealthy replica of a component stays visible instead of being
 * averaged away, and a component with no replicas still counts as pending rather than disappearing. */
const toEntries = (instances: DeploymentInstanceComponents[]): Entry[] =>
    instances.flatMap((instance) =>
        instance.components.flatMap((component) => {
            const label = componentLabel(instance.stackName, component.name)
            const key = `${instance.instanceId}-${component.name}`
            return component.replicas.length === 0
                ? [{ key, label, status: { label: 'Not running', tone: 'neutral' as const } }]
                : component.replicas.map((replica) => ({ key: `${key}-${replica.name}`, label, status: replicaStatus(replica) }))
        })
    )

/* The deployment's components counted by state in one chip, a segment per state that has any. Clicking
 * it lists every component under its state, so the whole picture is one click away. */
const StatusChip: FC<{ entries: Entry[] }> = ({ entries }) => {
    const anchor = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    const groups = SUMMARY_TONES.map((tone) => ({ tone, entries: entries.filter((entry) => entry.status.tone === tone) })).filter((group) => group.entries.length > 0)
    const summary = groups.map((group) => `${group.entries.length} ${TONE_WORDS[group.tone]}`).join(', ')

    /* The popover closes itself only on a click outside, so Escape is handled here, returning focus to the chip. */
    useEffect(() => {
        if (!open) {
            return
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
                anchor.current?.focus()
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open])

    if (groups.length === 0) {
        return null
    }

    return (
        <>
            <button ref={anchor} type="button" className={styles.chip} aria-label={summary} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
                {groups.map((group) => (
                    <span key={group.tone} className={`${styles.segment} ${styles[group.tone]}`}>
                        <ToneIcon tone={group.tone} />
                        {group.entries.length}
                    </span>
                ))}
            </button>
            {open && (
                <Popover reference={anchor} placement="bottom-start" arrow={false} onClickOutside={() => setOpen(false)}>
                    <div className={styles.popover}>
                        {groups.map((group) => (
                            <section key={group.tone} className={styles[group.tone]}>
                                <div className={styles.popoverTitle}>
                                    <ToneIcon tone={group.tone} />
                                    {group.entries.length} {TONE_WORDS[group.tone]}
                                </div>
                                <ul className={styles.list}>
                                    {group.entries.map((entry) => (
                                        <li key={entry.key} className={styles.item}>
                                            <span>{entry.label}</span>
                                            {/* Only a status the heading doesn't already say, such as "Not running" among the pending. */}
                                            {!entry.status.label.toLowerCase().startsWith(TONE_WORDS[group.tone]) && (
                                                <span className={styles.itemStatus}>{entry.status.label}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>
                </Popover>
            )}
        </>
    )
}

export const DeploymentComponentTags: FC<{ instances?: DeploymentInstanceComponents[]; loading: boolean; error?: unknown }> = ({ instances, loading, error }) => {
    if (loading && !instances) {
        /* A placeholder the size of a one-state chip, so rows keep their shape while each one's
         * components load. It holds nothing: the deploy status the list already has answers a
         * different question, and showing it first would flash a signal the chip then replaces. */
        return (
            <span className={styles.ghost}>
                <span className={styles.visuallyHidden}>Loading status</span>
            </span>
        )
    }
    if (error || !instances) {
        return null
    }

    return <StatusChip entries={toEntries(instances)} />
}
