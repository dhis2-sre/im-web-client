import { Button, CircularLoader } from '@dhis2/ui'
import type { FC } from 'react'
import { useLiveComponents } from '../../../hooks/index.ts'
import { ComponentsTable } from './components-table.tsx'
import styles from './instance-components.module.css'

export const DeploymentComponents: FC<{ deploymentId: number }> = ({ deploymentId }) => {
    const { instances, loading, error, refetch } = useLiveComponents(deploymentId)

    return (
        <>
            <div className={styles.header}>
                <h3>Components</h3>
                {/* Redundant once the backend pushes component-status events; kept until that is
                 * deployed so the page never lacks both live updates and a manual refresh. */}
                <Button small onClick={() => refetch()} loading={loading} dataTest="refresh-components-button">
                    Refresh
                </Button>
            </div>
            {/* The listing queries the cluster for every component of every instance, so it is slow
             * by nature; show that something is happening rather than nothing. */}
            {loading && !instances && (
                <div className={styles.loading} data-test="deployment-components-loading">
                    <CircularLoader small />
                    <span>Fetching components from the cluster...</span>
                </div>
            )}
            {error && !loading && <p className={styles.empty}>Could not load components, is the backend up to date?</p>}
            {(instances ?? []).map((instance) => (
                <div key={instance.instanceId} className={styles.instanceComponents}>
                    <ComponentsTable instanceId={instance.instanceId} stackName={instance.stackName} components={instance.components} onChanged={refetch} />
                </div>
            ))}
        </>
    )
}
