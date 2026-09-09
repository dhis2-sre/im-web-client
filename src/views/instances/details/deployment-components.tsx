import { CircularLoader } from '@dhis2/ui'
import type { FC } from 'react'
import { useLiveComponents } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'
import { InstanceComponentsSection } from './instance-components-section.tsx'
import styles from './instance-components.module.css'

export const DeploymentComponents: FC<{ deployment: Deployment }> = ({ deployment }) => {
    const { instances, loading, error, refetch } = useLiveComponents(deployment.id)

    return (
        <>
            <h3 className={styles.heading}>Components</h3>
            {/* The listing queries the cluster for every component of every instance, so it is slow
             * by nature; show that something is happening rather than nothing. */}
            {loading && !instances && (
                <div className={styles.loading} data-test="deployment-components-loading">
                    <CircularLoader small />
                    <span>Fetching components from the cluster...</span>
                </div>
            )}
            {error && !loading && <p className={styles.empty}>Could not load components, is the backend up to date?</p>}
            {(instances ?? []).map((instanceComponents) => (
                <InstanceComponentsSection
                    key={instanceComponents.instanceId}
                    instanceComponents={instanceComponents}
                    instance={deployment.instances?.find((candidate) => candidate.id === instanceComponents.instanceId)}
                    onChanged={refetch}
                />
            ))}
        </>
    )
}
