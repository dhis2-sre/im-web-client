import { Button, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import { Fragment, useState } from 'react'
import type { FC } from 'react'
import { componentStatus, MomentFromNow, replicaStatus, StatusIndicator } from '../../../components/index.ts'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import { ComponentDetailsDrawer } from './component-details-drawer.tsx'
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
    onChanged: () => void
}> = ({ instanceId, stackName, components, parametersByComponent, namespace, instanceName, groupId, onChanged }) => {
    const [viewing, setViewing] = useState<string>()
    const viewed = components.find((component) => component.name === viewing)

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
            onChanged={onChanged}
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
                                        <button type="button" className={styles.nameLink} onClick={() => setViewing(component.name)}>
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
                                            <Button small secondary aria-label={`View ${component.name}`} onClick={() => setViewing(component.name)}>
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
            {viewed && (
                <ComponentDetailsDrawer stackName={stackName} component={viewed} parameters={parametersByComponent[viewed.name] ?? []} onClose={() => setViewing(undefined)} />
            )}
        </>
    )
}
