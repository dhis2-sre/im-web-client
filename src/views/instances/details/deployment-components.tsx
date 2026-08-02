import { Button, CircularLoader } from '@dhis2/ui'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DeploymentInstanceComponents } from '../../../types/index.ts'
import { ComponentsTable } from './components-table.tsx'
import styles from './instance-components.module.css'

export const DeploymentComponents: FC<{ deploymentId: number }> = ({ deploymentId }) => {
    const [{ data: instances, loading, error }, refetch] = useAuthAxios<DeploymentInstanceComponents[]>(
        { url: `/deployments/${deploymentId}/components` },
        { useCache: false, autoCatch: true }
    )

    return (
        <>
            <div className={styles.header}>
                <h3>Components</h3>
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
