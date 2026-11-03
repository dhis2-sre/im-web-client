import { Button, Input, SegmentedControl, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FC, MouseEvent } from 'react'
import { componentStatus, Drawer, MomentFromNow, StatusDot } from '../../../../components/index.ts'
import { useDebouncedState } from '../../../../hooks/use-debounce-state.ts'
import type { InstanceComponent } from '../../../../types/index.ts'
import { grafanaLogsUrl } from '../../../../utils/grafana-logs.ts'
import styles from './log-drawer.module.css'
import { RENDER_LINES, visibleEntries } from './log-lines.ts'
import type { LevelFilter, LogEntry } from './log-lines.ts'
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
    const [paused, setPaused] = useState<{ total: number; entries: LogEntry[] }>()
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

    /* While paused, what had arrived by then, as it was, so the cap dropping old lines can't empty the view.
     * Holding on to the array is safe since appendCapped always makes a new one rather than changing it. */
    const held = paused ? paused.entries : entries
    const visible = useMemo(() => visibleEntries(held, filter.debouncedValue, level), [held, filter.debouncedValue, level])
    const drawn = useMemo(() => (visible.length > shown ? visible.slice(visible.length - shown) : visible), [visible, shown])
    const needle = filter.debouncedValue.toLowerCase()

    const box = useRef<HTMLDivElement>(null)
    const controls = useRef<HTMLDivElement>(null)
    // Where this code last put the view, so any move up from there is the reader's
    const placedTop = useRef(0)
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
        placedTop.current = element.scrollTop
    }, [drawn, paused, wrap, status])

    /* Try again, Show earlier and the new-lines pill go away once used, and focus would fall out of the
     * drawer's trap to the page behind, so it moves to Pause or Resume instead. */
    const used = useRef<HTMLElement>(undefined)
    useEffect(() => {
        if (used.current && !used.current.isConnected) {
            controls.current?.querySelector<HTMLElement>('button[name="follow"]')?.focus()
        }
        used.current = undefined
    })
    const leaving = (event: MouseEvent<HTMLElement>) => {
        used.current = event.currentTarget
    }

    const pause = () => setPaused({ total, entries })
    const follow = () => {
        setPaused(undefined)
        setShown(RENDER_LINES)
    }

    /* Any move up pauses, however slow. Clamping to the end, as when the box grows, isn't one, and the
     * slack only decides whether a view moved some other way is still at the end. */
    const onScroll = () => {
        const element = box.current
        if (!element || paused) {
            return
        }
        const below = element.scrollHeight - element.scrollTop - element.clientHeight
        if (below > FOLLOW_SLACK_PX || (below > 1 && element.scrollTop < placedTop.current - 1)) {
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

    // Input rather than InputField, which drops the accessible name; its types leave ariaLabel out
    const untyped: Record<string, unknown> = { ariaLabel: 'Filter lines' }
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
                <Button
                    small
                    secondary
                    onClick={(_, event) => {
                        leaving(event)
                        retry()
                    }}
                >
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
                <div ref={controls} className={styles.bar}>
                    {/* Focus starts here rather than on Open in Grafana, where Enter would open another tab */}
                    <Input
                        dense
                        clearable
                        initialFocus
                        {...untyped}
                        placeholder="Filter lines"
                        width="260px"
                        value={filter.liveValue}
                        onChange={({ value }) => setQuery(value ?? '')}
                    />
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
                    <output className={`${styles.state} ${tone}`}>{label}</output>
                    {paused ? (
                        <Button small secondary name="follow" onClick={follow}>
                            Resume
                        </Button>
                    ) : (
                        <Button small secondary name="follow" onClick={pause}>
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
                                <Button
                                    small
                                    secondary
                                    onClick={(_, event) => {
                                        leaving(event)
                                        showEarlier()
                                    }}
                                >
                                    Show {count(earlier, 'earlier line', 'earlier lines')}
                                </Button>
                            </div>
                        )}
                        <div className={styles.rows}>
                            {drawn.map((entry) => (
                                <LogRow key={entry.id} entry={entry} needle={needle} />
                            ))}
                        </div>
                        {empty && (status === 'connecting' || status === 'reconnecting') && <p className={styles.quiet}>{STATUS_LABELS[status]}</p>}
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
                            <Button
                                small
                                primary
                                onClick={(_, event) => {
                                    leaving(event)
                                    follow()
                                }}
                            >
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
