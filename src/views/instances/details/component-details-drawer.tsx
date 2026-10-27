import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { FC } from 'react'
import { componentStatus, Drawer, MomentFromNow, replicaStatus, StatusDot, StatusIndicator } from '../../../components/index.ts'
import { InstanceComponent } from '../../../types/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import { ComponentParametersTable } from './component-parameters-table.tsx'
import styles from './instance-components.module.css'

/* Everything about one component that is too long for its row: each replica, and every parameter. */
export const ComponentDetailsDrawer: FC<{ stackName: string; component: InstanceComponent; parameters: ParameterEntry[]; onClose: () => void }> = ({
    stackName,
    component,
    parameters,
    onClose,
}) => (
    <Drawer
        title={
            <>
                {component.name} <StatusDot status={componentStatus(component)} />
            </>
        }
        description={`Component of ${stackName}`}
        onClose={onClose}
    >
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
                            <DataTableColumnHeader align="right">Restarts</DataTableColumnHeader>
                            <DataTableColumnHeader>Created</DataTableColumnHeader>
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
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            )}
        </section>
        <section className={styles.section} aria-label="Parameters">
            <h3 className={styles.sectionTitle}>Parameters</h3>
            {parameters.length === 0 ? <p className={styles.muted}>This component has no parameters of its own.</p> : <ComponentParametersTable parameters={parameters} />}
        </section>
    </Drawer>
)
