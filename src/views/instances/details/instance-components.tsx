import { Button, CircularLoader } from '@dhis2/ui'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { InstanceComponent } from '../../../types/index.ts'
import { ComponentsTable } from './components-table.tsx'
import styles from './instance-components.module.css'

export const InstanceComponents: FC<{ instanceId: number }> = ({ instanceId }) => {
    const [{ data: components, loading, error }, refetch] = useAuthAxios<InstanceComponent[]>({ url: `/instances/${instanceId}/components` }, { useCache: false, autoCatch: true })

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
            <div className={styles.header}>
                <h3>Components</h3>
                <Button small onClick={() => refetch()} loading={loading} dataTest="refresh-components-button">
                    Refresh
                </Button>
            </div>
            <ComponentsTable instanceId={instanceId} components={components ?? []} onChanged={refetch} />
        </>
    )
}
