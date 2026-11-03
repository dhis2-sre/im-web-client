import { Button, InputField, SegmentedControl, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FC } from 'react'
import { componentStatus, Drawer, MomentFromNow, StatusDot } from '../../../../components/index.ts'
import { useDebouncedState } from '../../../../hooks/use-debounce-state.ts'
import type { InstanceComponent } from '../../../../types/index.ts'
import { grafanaLogsUrl } from '../../../../utils/grafana-logs.ts'
import styles from './log-drawer.module.css'
import { RENDER_LINES, visibleEntries } from './log-lines.ts'
import type { LevelFilter } from './log-lines.ts'
import { LogRow } from './log-row.tsx'
import { useLogStream } from './use-log-stream.ts'
import type { StreamStatus } from './use-log-stream.ts'

/* No "All": tail=0 makes the server send the whole log, however large, and the browser decode all of it. */
const TAILS = [100, 1000, 5000]
const LEVELS = [
    { label: 'All', value: 'all' },
    { label: 'Warnings', value: 'warn' },
    { label: 'Errors', value: 'error' },
]
const STATUS_LABELS: Record<StreamStatus, string> = {
    connecting: 'Connecting…',
    live: 'Live',
    waiting: 'Waiting',
    reconnecting: 'Reconnecting…',
    error: 'Not connected',
}
// Further than this from the end counts as reading back, which pauses following
const FOLLOW_SLACK_PX = 32
const COPIED_MS = 2000

const count = (n: number, one: string, many: string) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`

/* An instance's log, followed live. It lives in the components table rather than the row's menu, so it
 * stays open when the row goes away because its pod was replaced. */
export const LogDrawer: FC<{
    instanceId: number
    component: InstanceComponent
    initialReplica: string
    namespace?: string
    instanceName?: string
    groupId?: number
    onClose: () => void
}> = ({ instanceId, component, initialReplica, namespace, instanceName, groupId, onClose }) => {
    // The replica the reader chose, and the one actually streamed, which differ once the chosen one is replaced
    const [picked, setPicked] = useState(initialReplica)
    const [replica, setReplica] = useState(initialReplica)
    // Empty means whichever container the API picks, the first one the pod declares
    const [container, setContainer] = useState('')
    const [tail, setTail] = useState(1000)
    const filter = useDebouncedState({ initialValue: '' })
    const [level, setLevel] = useState<LevelFilter>('all')
    const [wrap, setWrap] = useState(true)
    const [paused, setPaused] = useState<{ total: number; lastId: number }>()
    const [shown, setShown] = useState(RENDER_LINES)
    const [copyLabel, setCopyLabel] = useState('Copy')

    /* A pod replaced after a crash takes its name with it, and asking for that name again would only get a 404.
     * Switching here, during render, means no request is ever made for it. The reset key stays on the picked
     * one, so the lines stay and the stream marks the switch with a divider. */
    if (component.replicas.length > 0 && !component.replicas.some(({ name }) => name === replica)) {
        setReplica(component.replicas[0].name)
    }

    const selected = component.replicas.find(({ name }) => name === replica)
    const containers = selected?.containers ?? []
    const { entries, total, dropped, status, error, retry } = useLogStream(
        { instanceId, selector: component.name, replica, container: container || undefined, tail },
        selected?.restarts ?? 0,
        `${picked}|${container}|${tail}`
    )
    const grafanaUrl = grafanaLogsUrl({ namespace, instanceName, groupId, component: component.name })

    /* While paused, only what had arrived by then. By id rather than by count, since a divider that arrives
     * meanwhile is an entry but not a line. */
    const held = useMemo(() => {
        if (!paused) {
            return entries
        }
        let end = entries.length
        while (end > 0 && entries[end - 1].id > paused.lastId) {
            end--
        }
        return entries.slice(0, end)
    }, [entries, paused])
    const visible = useMemo(() => visibleEntries(held, filter.debouncedValue, level), [held, filter.debouncedValue, level])
    const drawn = useMemo(() => (visible.length > shown ? visible.slice(visible.length - shown) : visible), [visible, shown])
    const needle = filter.debouncedValue.toLowerCase()

    const box = useRef<HTMLDivElement>(null)
    // How far the view was from the end before earlier lines went in above it
    const fromEnd = useRef<number | undefined>(undefined)

    /* Before paint, so neither the jump to the end nor the restored position flickers. drawn, wrap and status
     * are here as triggers: each changes the height of what is in the box. */
    useLayoutEffect(() => {
        const element = box.current
        if (!element) {
            return
        }
        if (fromEnd.current !== undefined) {
            element.scrollTop = element.scrollHeight - fromEnd.current
            fromEnd.current = undefined
        } else if (!paused) {
            element.scrollTop = element.scrollHeight
        }
    }, [drawn, paused, wrap, status])

    const pause = () => setPaused({ total, lastId: entries[entries.length - 1]?.id ?? -1 })
    const follow = () => {
        setPaused(undefined)
        setShown(RENDER_LINES)
    }

    const onScroll = () => {
        const element = box.current
        if (element && !paused && element.scrollHeight - element.scrollTop - element.clientHeight > FOLLOW_SLACK_PX) {
            pause()
        }
    }

    const showEarlier = () => {
        const element = box.current
        if (element) {
            fromEnd.current = element.scrollHeight - element.scrollTop
        }
        setShown(shown + RENDER_LINES)
    }

    const setQuery = (value: string) => {
        filter.setValue(value)
        setShown(RENDER_LINES)
    }
    const clearFilter = () => {
        setQuery('')
        setLevel('all')
    }

    const copy = () =>
        // Inside the promise, since navigator.clipboard is missing altogether outside a secure context
        Promise.resolve()
            .then(() => navigator.clipboard.writeText(visible.map(({ text }) => text).join('\n')))
            .then(
                () => 'Copied',
                () => 'Copy failed'
            )
            .then((label) => {
                setCopyLabel(label)
                setTimeout(() => setCopyLabel('Copy'), COPIED_MS)
            })

    const download = () => {
        const url = URL.createObjectURL(new Blob([entries.map(({ text }) => text).join('\n')], { type: 'text/plain' }))
        const link = document.createElement('a')
        link.href = url
        link.download = container ? `${replica}-${container}.log` : `${replica}.log`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url))
    }

    const label = paused && (status === 'live' || status === 'reconnecting') ? 'Paused' : STATUS_LABELS[status]
    const tone = label === 'Paused' ? styles.paused : status === 'live' ? styles.live : ''
    const empty = entries.length === 0
    const earlier = Math.min(RENDER_LINES, visible.length - drawn.length)
    const message =
        status === 'waiting' ? (
            <>
                <b>{component.name} is still starting up</b> Logs will appear here as soon as the container starts. You don&apos;t need to reopen this.
            </>
        ) : status === 'error' ? (
            <>
                <b>Couldn&apos;t load the log</b> {error}
                <Button small secondary onClick={retry}>
                    Try again
                </Button>
            </>
        ) : undefined

    return (
        <Drawer
            size="wide"
            title={
                <>
                    Logs: {component.name} <StatusDot status={componentStatus(component)} />
                </>
            }
            description={
                selected && (
                    <>
                        started <MomentFromNow date={selected.createdAt} /> · {count(selected.restarts, 'restart', 'restarts')}
                    </>
                )
            }
            actions={
                grafanaUrl && (
                    <Button small secondary onClick={() => void window.open(grafanaUrl, '_blank', 'noopener,noreferrer')}>
                        Open in Grafana ↗
                    </Button>
                )
            }
            onClose={onClose}
        >
            <div className={styles.root}>
                <div className={styles.bar}>
                    {component.replicas.length > 1 && (
                        <SingleSelectField
                            dense
                            className={styles.field}
                            label="Replica"
                            selected={replica}
                            onChange={({ selected: name }) => {
                                setPicked(name)
                                setReplica(name)
                                setContainer('')
                                follow()
                            }}
                        >
                            {component.replicas.map(({ name }) => (
                                <SingleSelectOption key={name} label={name} value={name} />
                            ))}
                        </SingleSelectField>
                    )}
                    {containers.length > 1 && (
                        <SingleSelectField
                            dense
                            className={styles.field}
                            label="Container"
                            selected={container || containers[0]}
                            onChange={({ selected: name }) => {
                                setContainer(name)
                                follow()
                            }}
                        >
                            {containers.map((name) => (
                                <SingleSelectOption key={name} label={name} value={name} />
                            ))}
                        </SingleSelectField>
                    )}
                    <SingleSelectField
                        dense
                        className={styles.field}
                        label="Lines"
                        selected={String(tail)}
                        onChange={({ selected: lines }) => {
                            setTail(Number(lines))
                            follow()
                        }}
                    >
                        {TAILS.map((lines) => (
                            <SingleSelectOption key={lines} label={lines.toLocaleString('en')} value={String(lines)} />
                        ))}
                    </SingleSelectField>
                </div>
                <div className={styles.bar}>
                    <InputField dense clearable placeholder="Filter lines" inputWidth="260px" value={filter.liveValue} onChange={({ value }) => setQuery(value ?? '')} />
                    {filter.debouncedValue && (
                        <span className={styles.count}>
                            {visible.length.toLocaleString('en')} of {count(held.filter(({ kind }) => kind === 'line').length, 'line', 'lines')}
                        </span>
                    )}
                    <SegmentedControl
                        options={LEVELS}
                        selected={level}
                        onChange={({ value }) => {
                            setLevel(value as LevelFilter)
                            setShown(RENDER_LINES)
                        }}
                    />
                    <span className={styles.spacer} />
                    <span className={`${styles.state} ${tone}`}>{label}</span>
                    {paused ? (
                        <Button small secondary onClick={follow}>
                            Resume
                        </Button>
                    ) : (
                        <Button small secondary onClick={pause}>
                            Pause
                        </Button>
                    )}
                    <Button small secondary toggled={wrap} aria-pressed={wrap} onClick={() => setWrap(!wrap)}>
                        Wrap
                    </Button>
                    <Button small secondary onClick={copy}>
                        {copyLabel}
                    </Button>
                    <Button small secondary onClick={download}>
                        Download
                    </Button>
                </div>
                <div className={styles.frame}>
                    <div ref={box} className={wrap ? `${styles.log} ${styles.wrap}` : styles.log} onScroll={onScroll}>
                        {dropped > 0 && (
                            <p className={styles.note}>
                                Showing the most recent lines only.{' '}
                                {grafanaUrl ? (
                                    <a href={grafanaUrl} target="_blank" rel="noopener noreferrer">
                                        Older lines are in Grafana
                                    </a>
                                ) : (
                                    'Older lines are in Grafana'
                                )}
                            </p>
                        )}
                        {earlier > 0 && (
                            <div className={styles.earlier}>
                                <Button small secondary onClick={showEarlier}>
                                    Show {count(earlier, 'earlier line', 'earlier lines')}
                                </Button>
                            </div>
                        )}
                        <div className={styles.rows}>
                            {drawn.map((entry) => (
                                <LogRow key={entry.id} entry={entry} needle={needle} />
                            ))}
                        </div>
                        {empty && status === 'connecting' && <p className={styles.quiet}>Connecting…</p>}
                        {empty && message && <div className={styles.empty}>{message}</div>}
                        {visible.length === 0 && held.length > 0 && (
                            <div className={styles.empty}>
                                <b>No lines match</b>
                                <Button small secondary onClick={clearFilter}>
                                    Clear filter
                                </Button>
                            </div>
                        )}
                    </div>
                    {paused && total > paused.total && (
                        <div className={styles.pill}>
                            <Button small primary onClick={follow}>
                                ↓ {count(total - paused.total, 'new line', 'new lines')}
                            </Button>
                        </div>
                    )}
                </div>
                {!empty && message && <div className={styles.endbar}>{message}</div>}
            </div>
        </Drawer>
    )
}
