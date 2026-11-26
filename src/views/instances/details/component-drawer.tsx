import { Button, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconLaunch16, Tab, TabBar } from '@dhis2/ui'
import { useCallback, useState } from 'react'
import type { FC } from 'react'
import { componentStatus, Drawer, MomentFromNow, replicaStatus, StatusDot, StatusIndicator } from '../../../components/index.ts'
import { InstanceComponent } from '../../../types/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import { grafanaLogsUrl } from '../../../utils/grafana-logs.ts'
import { ComponentParametersTable } from './component-parameters-table.tsx'
import styles from './instance-components.module.css'
import { LogPanel } from './logs/log-panel.tsx'

export type ComponentTab = 'details' | 'logs'

/* Everything about one component that is too long for its row: each replica and every parameter on
 * Details, and the live log on Logs. It lives in the components table rather than the row's menu, so it
 * stays open when the row goes away because its pod was replaced. */
export const ComponentDrawer: FC<{
    instanceId: number
    stackName: string
    component: InstanceComponent
    parameters: ParameterEntry[]
    initialTab: ComponentTab
    initialReplica?: string
    namespace?: string
    instanceName?: string
    groupId?: number
    onClose: () => void
}> = ({ instanceId, stackName, component, parameters, initialTab, initialReplica, namespace, instanceName, groupId, onClose }) => {
    const [tab, setTab] = useState(initialTab)
    // Mounted on first visit and kept, so going back to Details doesn't lose the reader's filter or place
    const [logsOpened, setLogsOpened] = useState(initialTab === 'logs')
    // A replica's Logs button starts a fresh log for it, even when it is the one already showing
    const [logReplica, setLogReplica] = useState({ name: initialReplica, picks: 0 })
    /* Without a pick, the first replica, including one that only turns up while the drawer is open. Held once
     * the log opens: following a replacement is the panel's job, and a new name here would start it over. */
    if (logsOpened && !logReplica.name && component.replicas.length > 0) {
        setLogReplica({ ...logReplica, name: component.replicas[0].name })
    }
    const replicaName = logReplica.name ?? component.replicas[0]?.name
    const grafanaUrl = grafanaLogsUrl({ namespace, instanceName, groupId, component: component.name })

    /* Opening on Details puts focus on the tabs rather than on Open in Grafana, where Enter would open another
     * tab. A ref rather than an effect, since the drawer's layer mounts its contents a render later. */
    const focusTabs = useCallback(
        (node: HTMLDivElement | null) => {
            if (node && initialTab === 'details') {
                node.querySelector<HTMLElement>('[role="tablist"]')?.focus()
            }
        },
        [initialTab]
    )

    const show = (next: ComponentTab) => {
        setTab(next)
        if (next === 'logs') {
            setLogsOpened(true)
        }
    }
    const showLogs = (replica: string) => {
        setLogReplica({ name: replica, picks: logReplica.picks + 1 })
        show('logs')
    }

    return (
        <Drawer
            size="wide"
            title={
                <>
                    {component.name} <StatusDot status={componentStatus(component)} />
                </>
            }
            description={`Component of ${stackName}`}
            actions={
                grafanaUrl && (
                    <Button small secondary icon={<IconLaunch16 />} onClick={() => void window.open(grafanaUrl, '_blank', 'noopener,noreferrer')}>
                        Open in Grafana
                    </Button>
                )
            }
            tabs={
                <div ref={focusTabs}>
                    <TabBar>
                        <Tab selected={tab === 'details'} onClick={() => show('details')}>
                            Details
                        </Tab>
                        <Tab selected={tab === 'logs'} onClick={() => show('logs')}>
                            Logs
                        </Tab>
                    </TabBar>
                </div>
            }
            onClose={onClose}
        >
            {tab === 'details' && (
                <>
                    <section className={styles.section} aria-label="Replicas">
                        <h3 className={styles.sectionTitle}>Replicas</h3>
                        {component.replicas.length === 0 ? (
                            <p className={styles.muted}>No replicas are running.</p>
                        ) : (
                            <DataTable>
                                <DataTableHead>
                                    <DataTableRow>
                                        <DataTableColumnHeader>Replica</DataTableColumnHeader>
                                        <DataTableColumnHeader>Status</DataTableColumnHeader>
                                        <DataTableColumnHeader align="right" className="header-end">
                                            Restarts
                                        </DataTableColumnHeader>
                                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                                        <DataTableColumnHeader />
                                    </DataTableRow>
                                </DataTableHead>
                                <DataTableBody>
                                    {component.replicas.map((replica) => (
                                        <DataTableRow key={replica.name}>
                                            <DataTableCell staticStyle>
                                                <span className={styles.mono}>{replica.name}</span>
                                            </DataTableCell>
                                            <DataTableCell staticStyle>
                                                <StatusIndicator status={replicaStatus(replica)} />
                                            </DataTableCell>
                                            <DataTableCell staticStyle align="right" className={styles.number}>
                                                {replica.restarts}
                                            </DataTableCell>
                                            <DataTableCell staticStyle>
                                                <MomentFromNow date={replica.createdAt} />
                                            </DataTableCell>
                                            <DataTableCell staticStyle align="right">
                                                <Button small secondary aria-label={`Logs of ${replica.name}`} onClick={() => showLogs(replica.name)}>
                                                    Logs
                                                </Button>
                                            </DataTableCell>
                                        </DataTableRow>
                                    ))}
                                </DataTableBody>
                            </DataTable>
                        )}
                    </section>
                    <section className={styles.section} aria-label="Parameters">
                        <h3 className={styles.sectionTitle}>Parameters</h3>
                        {parameters.length === 0 ? (
                            <p className={styles.muted}>This component has no parameters of its own.</p>
                        ) : (
                            <ComponentParametersTable parameters={parameters} />
                        )}
                    </section>
                </>
            )}
            {tab === 'logs' && !replicaName && <p className={styles.muted}>No replicas are running.</p>}
            {logsOpened && replicaName && (
                <LogPanel
                    key={logReplica.picks}
                    instanceId={instanceId}
                    component={component}
                    initialReplica={replicaName}
                    grafanaUrl={grafanaUrl}
                    active={tab === 'logs'}
                    focusFilter={initialTab === 'logs' || logReplica.picks > 0}
                />
            )}
        </Drawer>
    )
}
