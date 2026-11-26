import { Button, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import { Fragment, useState } from 'react'
import type { FC } from 'react'
import { componentStatus, MomentFromNow, replicaStatus, StatusIndicator } from '../../../components/index.ts'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import { ComponentDrawer } from './component-drawer.tsx'
import type { ComponentTab } from './component-drawer.tsx'
import { ComponentOperationsMenu } from './component-operations-menu.tsx'
import styles from './instance-components.module.css'

/* One row per component, since that is what parameters and most operations belong to. A component
 * almost always runs a single replica, which folds into the component's own row. Several are listed
 * under it, always visible, so one failing copy among healthy siblings cannot hide behind a fold.
 * Parameters run to dozens for some components, so they open in a drawer rather than in the table. */
export const ComponentsTable: FC<{
    instanceId: number
    stackName: string
    components: InstanceComponent[]
    parametersByComponent: Record<string, ParameterEntry[]>
    namespace?: string
    instanceName?: string
    groupId?: number
    groupName?: string
    onChanged: () => void
}> = ({ instanceId, stackName, components, parametersByComponent, namespace, instanceName, groupId, groupName, onChanged }) => {
    /* Held here rather than in the row's menu, which goes away with its replica's row when the pod is
     * replaced, while the log should carry on. The component is looked up by name so it stays live. */
    const [open, setOpen] = useState<{ component: string; tab: ComponentTab; replica?: string }>()
    const opened = components.find((component) => component.name === open?.component)
    const view = (component: InstanceComponent) => setOpen({ component: component.name, tab: 'details' })

    const operations = (component: InstanceComponent, replica?: InstanceComponentReplica, replicaOnly?: boolean) => (
        <ComponentOperationsMenu
            instanceId={instanceId}
            stackName={stackName}
            component={component}
            replica={replica}
            replicaOnly={replicaOnly}
            namespace={namespace}
            instanceName={instanceName}
            groupId={groupId}
            groupName={groupName}
            onChanged={onChanged}
            onShowLogs={(shown) => setOpen({ component: component.name, tab: 'logs', replica: shown.name })}
        />
    )

    return (
        <>
            <DataTable dataTest="instance-components">
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Component</DataTableColumnHeader>
                        <DataTableColumnHeader>Status</DataTableColumnHeader>
                        <DataTableColumnHeader>Replica</DataTableColumnHeader>
                        <DataTableColumnHeader align="right" className="header-end">
                            Restarts
                        </DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader />
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {components.map((component) => {
                        const only = component.replicas.length === 1 ? component.replicas[0] : undefined

                        return (
                            <Fragment key={component.name}>
                                <DataTableRow>
                                    <DataTableCell staticStyle>
                                        <button type="button" className={styles.nameLink} onClick={() => view(component)}>
                                            {component.name}
                                        </button>
                                    </DataTableCell>
                                    <DataTableCell staticStyle>
                                        <StatusIndicator status={componentStatus(component)} />
                                    </DataTableCell>
                                    <DataTableCell staticStyle>
                                        {only ? (
                                            <span className={styles.mono}>{only.name}</span>
                                        ) : (
                                            component.replicas.length > 1 && <span className={styles.muted}>{component.replicas.length} replicas</span>
                                        )}
                                    </DataTableCell>
                                    <DataTableCell staticStyle align="right" className={styles.number}>
                                        {only?.restarts}
                                    </DataTableCell>
                                    <DataTableCell staticStyle>{only && <MomentFromNow date={only.createdAt} />}</DataTableCell>
                                    <DataTableCell staticStyle align="right">
                                        <span className={styles.rowActions}>
                                            <Button small secondary aria-label={`View ${component.name}`} onClick={() => view(component)}>
                                                View
                                            </Button>
                                            {operations(component, only)}
                                        </span>
                                    </DataTableCell>
                                </DataTableRow>
                                {component.replicas.length > 1 &&
                                    component.replicas.map((replica) => (
                                        <DataTableRow key={replica.name}>
                                            <DataTableCell staticStyle />
                                            <DataTableCell staticStyle>
                                                <StatusIndicator status={replicaStatus(replica)} />
                                            </DataTableCell>
                                            <DataTableCell staticStyle>
                                                <span className={styles.mono}>{replica.name}</span>
                                            </DataTableCell>
                                            <DataTableCell staticStyle align="right" className={styles.number}>
                                                {replica.restarts}
                                            </DataTableCell>
                                            <DataTableCell staticStyle>
                                                <MomentFromNow date={replica.createdAt} />
                                            </DataTableCell>
                                            <DataTableCell staticStyle align="right">
                                                {operations(component, replica, true)}
                                            </DataTableCell>
                                        </DataTableRow>
                                    ))}
                            </Fragment>
                        )
                    })}
                </DataTableBody>
            </DataTable>
            {open && opened && (
                <ComponentDrawer
                    instanceId={instanceId}
                    stackName={stackName}
                    component={opened}
                    parameters={parametersByComponent[opened.name] ?? []}
                    initialTab={open.tab}
                    initialReplica={open.replica}
                    namespace={namespace}
                    instanceName={instanceName}
                    groupId={groupId}
                    onClose={() => setOpen(undefined)}
                />
            )}
        </>
    )
}
