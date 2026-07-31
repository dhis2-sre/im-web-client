import { CircularLoader, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DeploymentInstanceComponents, InstanceComponent } from '../../../types/index.ts'
import styles from './deployment-component-tags.module.css'

const getComponentTagProps = (component: InstanceComponent) => {
    if (component.replicas.length === 0) {
        return { neutral: true }
    }
    if (component.replicas.some((replica) => replica.phase === 'Failed')) {
        return { negative: true }
    }
    if (component.replicas.every((replica) => replica.ready)) {
        return { positive: true }
    }
    return { neutral: true }
}

/* One tag per component currently associated with the deployment, across all its instances,
 * colored by the state of the component's replicas in the cluster. */
export const DeploymentComponentTags: FC<{ deploymentId: number }> = ({ deploymentId }) => {
    const [{ data: instances, loading, error }] = useAuthAxios<DeploymentInstanceComponents[]>(
        { url: `/deployments/${deploymentId}/components` },
        { useCache: false, autoCatch: true }
    )

    if (loading && !instances) {
        return <CircularLoader extrasmall />
    }
    if (error || !instances) {
        return null
    }

    return (
        <span className={styles.tags}>
            {instances.flatMap((instance) =>
                instance.components.map((component) => (
                    <Tag key={`${instance.instanceId}-${component.name}`} {...getComponentTagProps(component)}>
                        {component.name}
                    </Tag>
                ))
            )}
        </span>
    )
}
