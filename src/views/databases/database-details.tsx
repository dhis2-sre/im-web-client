import { IconAttachment16, IconClockHistory16, IconFolder16, IconUser16 } from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DetailsTable, MetaFact, MetaLine, MomentFromNow, Mono, Page, Panel } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/generated/models/Database.ts'
import { DatabaseActionsMenu } from './database-actions-menu.tsx'
import { lockDescription } from './database-markers.tsx'

/* Who owns it, when it last changed and where it lives, in the instance page's order, then the files
 * saved with it. */
const databaseFacts = (db: Database): Record<string, ReactNode> => ({
    owner: db.user?.email && <MetaFact icon={<IconUser16 />}>Owned by {db.user.email}</MetaFact>,
    updated: db.updatedAt && (
        <MetaFact icon={<IconClockHistory16 />}>
            Updated <MomentFromNow date={db.updatedAt} />
        </MetaFact>
    ),
    group: db.groupName && <MetaFact icon={<IconFolder16 />}>{db.groupName}</MetaFact>,
    files: db.filestoreId && (
        <MetaFact icon={<IconAttachment16 />}>
            Files: <Link to={`/databases/${db.filestoreId}`}>{db.filestore?.name ?? `Filestore ${db.filestoreId}`}</Link>
            {db.filestore?.size ? ` (${prettyBytes(db.filestore.size)})` : ''}
        </MetaFact>
    ),
})

/* Everything else the database record holds, for whoever needs to find or refer to the dump itself.
 * Ids and paths are literal values, so they are set in monospace. */
const databaseDetails = (db: Database): Record<string, ReactNode> => ({
    'Type': db.type === 'fs' ? 'Filestore' : 'Database',
    'Size': db.size ? <span title={`${db.size.toLocaleString()} bytes`}>{prettyBytes(db.size)}</span> : 'Unknown',
    'Lock': db.lock ? lockDescription(db.lock) : 'Not locked',
    'Created': db.createdAt ? <MomentFromNow date={db.createdAt} /> : 'Unknown',
    'Storage path': db.url ? <Mono>{db.url}</Mono> : 'No file',
    'Slug': <Mono>{db.slug}</Mono>,
    'ID': <Mono>{db.id}</Mono>,
    'Download links': db.externalDownloads?.length ? `${db.externalDownloads.length} open` : undefined,
})

export const DatabaseDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [{ data: db, loading, error }, refetch] = useAuthAxios<Database>(`databases/${id}`)

    return (
        <Page
            parent={{ label: 'Databases', to: '/databases' }}
            title={db?.name}
            description={db?.description || undefined}
            band
            actions={db && <DatabaseActionsMenu database={db} buttons refetch={() => void refetch()} onDeleted={() => navigate('/databases')} />}
            loading={loading && !db}
            error={error && !db ? { title: "Couldn't load the database", description: error.message } : undefined}
            summary={db && <MetaLine items={databaseFacts(db)} />}
        >
            {db && (
                <Panel title="Details" flush>
                    <DetailsTable rows={databaseDetails(db)} />
                </Panel>
            )}
        </Page>
    )
}
