import { Button, IconApps16, IconBlock16, IconCheckmark16, IconClockHistory16 } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DetailsTable, MetaFact, MetaLine, MomentFromNow, Mono, Page, Panel } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Group } from '../../types/generated/models/Group.ts'
import { EditGroupModal } from './edit-group-modal.tsx'

/* Whether people can deploy to it, where it runs and when it last changed, in the database page's
 * order. */
const groupFacts = (group: Group): Record<string, ReactNode> => ({
    deployable: group.deployable ? (
        <MetaFact icon={<IconCheckmark16 />}>Members can create instances</MetaFact>
    ) : (
        <MetaFact icon={<IconBlock16 />}>Members can&apos;t create instances</MetaFact>
    ),
    cluster: group.cluster && (
        <MetaFact icon={<IconApps16 />}>
            On <Link to={`/clusters/${group.cluster.id}`}>{group.cluster.name}</Link>
        </MetaFact>
    ),
    updated: group.updatedAt && (
        <MetaFact icon={<IconClockHistory16 />}>
            Updated <MomentFromNow date={group.updatedAt} />
        </MetaFact>
    ),
})

/* Where its instances live in the cluster and on the web. These are literal values, so they are set
 * in monospace. */
const groupDetails = (group: Group): Record<string, ReactNode> => ({
    Namespace: group.namespace ? <Mono>{group.namespace}</Mono> : 'None',
    Hostname: group.hostname ? <Mono>{group.hostname}</Mono> : 'None',
    Created: group.createdAt ? <MomentFromNow date={group.createdAt} /> : 'Unknown',
    ID: <Mono>{group.id}</Mono>,
})

export const GroupDetails: FC = () => {
    const { name } = useParams<{ name: string }>()
    const [showEditModal, setShowEditModal] = useState(false)

    const [{ data: group, loading, error }, refetch] = useAuthAxios<Group>(`/groups/${name}/details`, { useCache: false })

    return (
        <Page
            parent={{ label: 'Groups', to: '/groups' }}
            title={group?.name ?? name}
            description={group?.description || undefined}
            band
            actions={group && <Button onClick={() => setShowEditModal(true)}>Edit…</Button>}
            loading={loading && !group}
            error={error && !group ? { title: "Couldn't load the group", description: error.message } : undefined}
            summary={group && <MetaLine items={groupFacts(group)} />}
        >
            {group && (
                <Panel title="Details" flush>
                    <DetailsTable rows={groupDetails(group)} />
                </Panel>
            )}

            {showEditModal && group && (
                <EditGroupModal
                    group={group}
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
