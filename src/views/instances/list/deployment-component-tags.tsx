import { CircularLoader, Tag } from '@dhis2/ui'
import type { FC } from 'react'
import { useLiveComponents } from '../../../hooks/index.ts'
import { getReplicaTagProps } from '../../../utils/replica-tag.ts'
import styles from './deployment-component-tags.module.css'

/* One tag per replica running for the deployment, across all its instances, labelled with the
 * component it belongs to and coloured by that replica's own health. A component with several
 * replicas therefore shows several tags, so one unhealthy replica stays visible instead of being
 * averaged away, and a component with none still shows as neutral rather than disappearing.
 *
 * The label carries the stack because these tags flatten every instance of the deployment into one
 * row, where a bare component name is ambiguous: a dhis2-v2 instance alongside a chap one shows two
 * components called db. The details page needs no such prefix, having a section per instance. */
export const DeploymentComponentTags: FC<{ deploymentId: number }> = ({ deploymentId }) => {
    const { instances, loading, error } = useLiveComponents(deploymentId)

    if (loading && !instances) {
        return <CircularLoader extrasmall />
    }
    if (error || !instances) {
        return null
    }

    return (
        <span className={styles.tags}>
            {instances.flatMap((instance) =>
                instance.components.flatMap((component) =>
                    component.replicas.length === 0
                        ? [
                              <Tag key={`${instance.instanceId}-${component.name}`} neutral>
                                  {`${instance.stackName}:${component.name}`}
                              </Tag>,
                          ]
                        : component.replicas.map((replica) => (
                              <Tag key={`${instance.instanceId}-${component.name}-${replica.name}`} {...getReplicaTagProps(replica)}>
                                  {`${instance.stackName}:${component.name}`}
                              </Tag>
                          ))
                )
            )}
        </span>
    )
}
