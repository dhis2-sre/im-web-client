import { Button, IconBlock16, IconCheckmark16, IconClockHistory16 } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailsTable, MetaFact, MetaLine, MomentFromNow, Mono, Page, Panel } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Cluster } from '../../types/index.ts'
import { EditClusterModal } from './edit-cluster-modal.tsx'

/* When it last changed and whether it scales itself, in the database page's order. */
const clusterFacts = (cluster: Cluster): Record<string, ReactNode> => ({
    updated: cluster.updatedAt && (
        <MetaFact icon={<IconClockHistory16 />}>
            Updated <MomentFromNow date={cluster.updatedAt} />
        </MetaFact>
    ),
    autoscaled: cluster.autoscaled ? <MetaFact icon={<IconCheckmark16 />}>Autoscaled</MetaFact> : <MetaFact icon={<IconBlock16 />}>Not autoscaled</MetaFact>,
})

const clusterDetails = (cluster: Cluster): Record<string, ReactNode> => ({
    Groups: cluster.groups?.length
        ? cluster.groups.map((group, i) => (
              <span key={group.name}>
                  {i > 0 && ', '}
                  <Link to={`/groups/${group.name}`}>{group.name}</Link>
              </span>
          ))
        : 'None',
    Created: cluster.createdAt ? <MomentFromNow date={cluster.createdAt} /> : 'Unknown',
    ID: <Mono>{cluster.id}</Mono>,
})

export const ClusterDetails: FC = () => {
    const { id } = useParams<{ id: string }>()
    const [showEditModal, setShowEditModal] = useState(false)

    const [{ data: cluster, loading, error }, refetch] = useAuthAxios<Cluster>(`/clusters/${id}`, { useCache: false })

    return (
        <Page
            parent={{ label: 'Clusters', to: '/clusters' }}
            title={cluster?.name}
            description={cluster?.description || undefined}
            band
            actions={cluster && <Button onClick={() => setShowEditModal(true)}>Edit</Button>}
            loading={loading && !cluster}
            error={error && !cluster ? { title: 'Could not fetch the cluster', description: error.message } : undefined}
            summary={cluster && <MetaLine items={clusterFacts(cluster)} />}
        >
            {cluster && (
                <Panel title="Details" flush>
                    <DetailsTable rows={clusterDetails(cluster)} />
                </Panel>
            )}

            {showEditModal && cluster && (
                <EditClusterModal
                    cluster={cluster}
                    onComplete={() => {
                        setShowEditModal(false)
                        void refetch()
                    }}
                    onCancel={() => setShowEditModal(false)}
                />
            )}
        </Page>
    )
}
