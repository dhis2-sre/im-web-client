import { useAlert } from '@dhis2/app-service-alerts'
import { Button, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconSync16, Tag } from '@dhis2/ui'
import { Fragment, useCallback, useState } from 'react'
import type { FC } from 'react'
import Moment from 'react-moment'
import { ConfirmationModal } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent, InstanceComponentReplica } from '../../../types/index.ts'
import styles from './instance-components.module.css'

const getReplicaTagProps = (replica: InstanceComponentReplica) => {
    if (replica.phase === 'Failed') {
        return { negative: true }
    }
    if (replica.phase === 'Running' && replica.ready) {
        return { positive: true }
    }
    return { neutral: true }
}

type RestartTarget = {
    selector: string
    replica?: string
}

const describeTarget = (target: RestartTarget) => (target.replica ? `replica "${target.replica}" of component "${target.selector}"` : `component "${target.selector}"`)

export const InstanceComponents: FC<{ instanceId: number }> = ({ instanceId }) => {
    const [{ data: components, loading, error }, refetch] = useAuthAxios<InstanceComponent[]>({ url: `/instances/${instanceId}/components` }, { useCache: false, autoCatch: true })
    const [restartTarget, setRestartTarget] = useState<RestartTarget | null>(null)

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const [{ loading: restarting }, restart] = useAuthAxios(
        {
            method: 'PUT',
            url: `/instances/${instanceId}/restart`,
        },
        { manual: true, autoCancel: false }
    )

    const onConfirmRestart = useCallback(async () => {
        const target = restartTarget
        setRestartTarget(null)
        if (!target) {
            return
        }
        try {
            await restart({ params: target })
            showAlert({ message: `Successfully requested restart of ${describeTarget(target)}`, isCritical: false })
            refetch()
        } catch (restartError) {
            showAlert({ message: `There was an error when restarting ${describeTarget(target)}`, isCritical: true })
            console.error(restartError)
        }
    }, [restartTarget, restart, showAlert, refetch])

    /* Instances deployed against a pre-3.0 backend have nothing to show here; hide the section
     * instead of surfacing the error. */
    if (error) {
        return null
    }

    /* The listing queries the cluster for every component's replicas, so it is slow by nature;
     * show that something is happening rather than nothing. */
    if (loading && !components) {
        return (
            <div className={styles.loading} data-test="instance-components-loading">
                <CircularLoader small />
                <span>Fetching components from the cluster...</span>
            </div>
        )
    }

    if (!loading && (!components || components.length === 0)) {
        return <p className={styles.empty}>No components</p>
    }

    return (
        <>
            {restartTarget && (
                <ConfirmationModal onCancel={() => setRestartTarget(null)} onConfirm={onConfirmRestart}>
                    Are you sure you want to restart {describeTarget(restartTarget)}?
                </ConfirmationModal>
            )}
            <div className={styles.header}>
                <h3>Components</h3>
                <Button small onClick={() => refetch()} loading={loading} dataTest="refresh-components-button">
                    Refresh
                </Button>
            </div>
            <DataTable dataTest="instance-components">
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Component</DataTableColumnHeader>
                        <DataTableColumnHeader>Replica</DataTableColumnHeader>
                        <DataTableColumnHeader>Status</DataTableColumnHeader>
                        <DataTableColumnHeader>Restarts</DataTableColumnHeader>
                        <DataTableColumnHeader>Created</DataTableColumnHeader>
                        <DataTableColumnHeader></DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody loading={loading}>
                    {(components ?? []).map((component) => (
                        <Fragment key={component.name}>
                            <DataTableRow>
                                <DataTableCell staticStyle>{component.name}</DataTableCell>
                                <DataTableCell></DataTableCell>
                                <DataTableCell>
                                    {component.supportedOperations.map((operation) => (
                                        <Tag key={operation}>{operation}</Tag>
                                    ))}
                                </DataTableCell>
                                <DataTableCell></DataTableCell>
                                <DataTableCell></DataTableCell>
                                <DataTableCell>
                                    {component.supportedOperations.includes('restart') && (
                                        <Button
                                            small
                                            icon={<IconSync16 />}
                                            disabled={restarting}
                                            onClick={() => setRestartTarget({ selector: component.name })}
                                            dataTest={`restart-component-${component.name}`}
                                        >
                                            Restart
                                        </Button>
                                    )}
                                </DataTableCell>
                            </DataTableRow>
                            {component.replicas.map((replica) => (
                                <DataTableRow key={replica.name}>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell staticStyle>{replica.name}</DataTableCell>
                                    <DataTableCell>
                                        <Tag {...getReplicaTagProps(replica)}>{replica.ready ? replica.phase : `${replica.phase} (not ready)`}</Tag>
                                    </DataTableCell>
                                    <DataTableCell>{replica.restarts}</DataTableCell>
                                    <DataTableCell>
                                        <Moment date={replica.createdAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>
                                        {component.supportedOperations.includes('restartReplica') && (
                                            <Button
                                                small
                                                icon={<IconSync16 />}
                                                disabled={restarting}
                                                onClick={() => setRestartTarget({ selector: component.name, replica: replica.name })}
                                                dataTest={`restart-replica-${replica.name}`}
                                            >
                                                Restart replica
                                            </Button>
                                        )}
                                    </DataTableCell>
                                </DataTableRow>
                            ))}
                            {component.replicas.length === 0 && (
                                <DataTableRow>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell>No replicas</DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell></DataTableCell>
                                    <DataTableCell></DataTableCell>
                                </DataTableRow>
                            )}
                        </Fragment>
                    ))}
                </DataTableBody>
            </DataTable>
        </>
    )
}
