import { DataTable, DataTableBody, DataTableCell, DataTableRow, IconAttachment16, IconClockHistory16, IconFolder16, IconUser16 } from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MetaFact, MetaLine, MomentFromNow, Page, Panel } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/generated/models/Database.ts'
import { DatabaseActionsMenu } from './database-actions-menu.tsx'
import styles from './database-details.module.css'
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
const databaseDetails = (db: Database): { name: string; value: ReactNode }[] => [
    { name: 'Type', value: db.type === 'fs' ? 'Filestore' : 'Database' },
    { name: 'Size', value: db.size ? prettyBytes(db.size) : 'Unknown' },
    { name: 'Lock', value: db.lock ? lockDescription(db.lock) : 'Not locked' },
    { name: 'Created', value: db.createdAt ? <MomentFromNow date={db.createdAt} /> : 'Unknown' },
    { name: 'Storage path', value: db.url ? <span className={styles.mono}>{db.url}</span> : 'Not saved yet' },
    { name: 'Slug', value: <span className={styles.mono}>{db.slug}</span> },
    { name: 'ID', value: <span className={styles.mono}>{db.id}</span> },
    ...(db.externalDownloads?.length ? [{ name: 'Download links', value: `${db.externalDownloads.length} open` }] : []),
]

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
            error={error && !db ? { title: 'Could not fetch the database', description: error.message } : undefined}
            summary={db && <MetaLine items={databaseFacts(db)} />}
        >
            {db && (
                <Panel title="Details" flush>
                    <DataTable>
                        <DataTableBody>
                            {databaseDetails(db).map(({ name, value }) => (
                                <DataTableRow key={name}>
                                    <DataTableCell staticStyle className={styles.name}>
                                        {name}
                                    </DataTableCell>
                                    <DataTableCell staticStyle>{value}</DataTableCell>
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                    </DataTable>
                </Panel>
            )}
        </Page>
    )
}
