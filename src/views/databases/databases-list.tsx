import { Button, Checkbox, IconFolder16, Input } from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import { useState } from 'react'
import type { FC } from 'react'
import Moment from 'react-moment'
import { Breadcrumbs, ListPage, OnlyMineFilter } from '../../components/index.ts'
import type { Crumb, ListColumn } from '../../components/index.ts'
import type { Database, GroupsWithDatabases } from '../../types/index.ts'
import { DatabaseActionsMenu } from './database-actions-menu.tsx'
import { buildFlattenedList, buildTree, getNodeByPath } from './database-tree-utils.ts'
import styles from './databases-list.module.css'
import { Locked } from './locked.tsx'
import { UploadButton } from './upload-button.tsx'
import { useDatabases } from './use-databases.ts'

const VIEW_MODE_KEY = 'databaseViewMode'

/* A row is a database, or in the tree view a folder: a group, or a path segment within one. */
type DatabaseRow = { key: string; name: string; href: string; database?: Database }

/* Folder links keep the search, so opening a folder doesn't clear it. */
const treeHref = (query: string, group?: string, path?: string) => {
    const params = new URLSearchParams()
    if (query) {
        params.set('q', query)
    }
    if (group) {
        params.set('group', group)
    }
    if (path) {
        params.set('path', path)
    }
    const search = params.toString()
    return search ? `/databases?${search}` : '/databases'
}

const databaseRow = (database: Database, name = database.name): DatabaseRow => ({ key: `db-${database.id}`, name, href: `/databases/${database.id}`, database })

const fromDatabase =
    <V,>(value: (database: Database) => V, fallback: V) =>
    (row: DatabaseRow) =>
        row.database ? value(row.database) : fallback

/* The description rides under the name, since most databases have none. */
const columns: ListColumn<DatabaseRow>[] = [
    {
        key: 'name',
        label: 'Name',
        render: (row) =>
            row.database ? (
                row.name
            ) : (
                <span className={styles.folder}>
                    <IconFolder16 />
                    {row.name}
                </span>
            ),
        detail: fromDatabase((db) => db.description, null),
        sortValue: (row) => row.name,
        breakAnywhere: true,
    },
    {
        key: 'size',
        label: 'Size',
        render: fromDatabase((db) => <span title={`${db.size.toLocaleString()} bytes`}>{prettyBytes(db.size)}</span>, null),
        sortValue: fromDatabase((db) => db.size ?? 0, 0),
        nowrap: true,
    },
    { key: 'url', label: 'URL', render: fromDatabase((db) => db.url, null), sortValue: fromDatabase((db) => db.url ?? '', ''), breakAnywhere: true },
    {
        key: 'created',
        label: 'Created',
        render: fromDatabase(
            (db) => (
                <span title={db.createdAt}>
                    <Moment date={db.createdAt} fromNow />
                </span>
            ),
            null
        ),
        sortValue: fromDatabase((db) => db.createdAt ?? '', ''),
        nowrap: true,
    },
    {
        key: 'updated',
        label: 'Updated',
        render: fromDatabase(
            (db) => (
                <span title={db.updatedAt}>
                    <Moment date={db.updatedAt} fromNow />
                </span>
            ),
            null
        ),
        sortValue: fromDatabase((db) => db.updatedAt ?? '', ''),
        nowrap: true,
    },
    {
        key: 'files',
        label: 'Files',
        render: fromDatabase((db) => (db.filestoreId !== 0 ? 'Included' : null), null),
        sortValue: fromDatabase((db) => Number(!!db.filestoreId), 0),
        nowrap: true,
    },
    { key: 'lock', label: 'Lock', render: fromDatabase((db) => <Locked lock={db.lock} />, null), sortValue: fromDatabase((db) => Number(!!db.lock), 0) },
]

/* The tree view's rows and breadcrumb for where the search parameters point: the groups at the top,
 * then the folders and databases at a path within one group. The breadcrumb follows the parameters
 * alone, so it is in place while the rows load. */
const treeView = (
    groups: GroupsWithDatabases[] | undefined,
    { group, path, query }: { group: string | null; path: string; query: string }
): { crumbs: Crumb[]; rows?: DatabaseRow[] } => {
    const href = (inGroup?: string, atPath?: string) => treeHref(query, inGroup, atPath)
    const root: Crumb = { label: 'Groups', to: href() }
    const groupRows = groups?.map((candidate): DatabaseRow => ({ key: `group-${candidate.name}`, name: candidate.name, href: href(candidate.name) }))
    if (!group) {
        return { crumbs: [root], rows: groupRows }
    }

    const segments = path.split('/').filter(Boolean)
    const crumbs = [root, { label: group, to: href(group) }, ...segments.map((segment, index) => ({ label: segment, to: href(group, segments.slice(0, index + 1).join('/')) }))]
    if (!groups) {
        return { crumbs }
    }
    // A group the filters leave empty is not in the list; fall back to the groups that are.
    const selected = groups.find((candidate) => candidate.name === group)
    if (!selected) {
        return { crumbs: [root], rows: groupRows }
    }

    const node = getNodeByPath(buildTree(selected.databases), path)
    const rows = buildFlattenedList(node, { currentPath: path }).map(
        (item): DatabaseRow => (item.database ? databaseRow(item.database, item.name) : { key: `folder-${item.path}`, name: item.name, href: href(group, item.path) })
    )
    return { crumbs, rows }
}

export const DatabasesList: FC = () => {
    const { params, groups, total, error, loading, refetch, onlyMine, setOnlyMine, searchTerm, setSearchTerm } = useDatabases()
    const [tree, setTree] = useState<boolean>(() => localStorage.getItem(VIEW_MODE_KEY) === 'hierarchy')
    const refresh = () => void refetch()

    const toggleTree = (next: boolean) => {
        setTree(next)
        localStorage.setItem(VIEW_MODE_KEY, next ? 'hierarchy' : 'flat')
    }

    const treeState = tree ? treeView(groups, { group: params.get('group'), path: params.get('path') ?? '', query: searchTerm }) : undefined
    const filtered = onlyMine || searchTerm !== ''

    return (
        <ListPage
            title="Databases"
            actions={<UploadButton onComplete={refresh} />}
            filters={
                <>
                    {/* Input rather than InputField, which drops the accessible name. Its types lag the component and
                     * leave ariaLabel out, so it goes in by spread. */}
                    <Input
                        {...{ ariaLabel: 'Search databases' }}
                        placeholder="Search databases…"
                        value={searchTerm}
                        onChange={({ value }) => setSearchTerm(value ?? '')}
                        dense
                        className={styles.search}
                    />
                    <Checkbox dense checked={tree} label="Tree view" onChange={({ checked }) => toggleTree(checked)} />
                    <OnlyMineFilter checked={onlyMine} onChange={setOnlyMine} />
                </>
            }
            above={treeState && <Breadcrumbs items={treeState.crumbs} />}
            columns={columns}
            rows={treeState?.rows}
            groups={treeState ? undefined : groups?.map((group) => ({ key: group.name, title: group.name, rows: group.databases.map((db) => databaseRow(db)) }))}
            rowKey={(row) => row.key}
            rowHref={(row) => row.href}
            renderRowActions={(row) => row.database && <DatabaseActionsMenu database={row.database} refetch={refresh} />}
            pinned={(row) => !row.database}
            loading={loading}
            error={error ? { title: 'Could not retrieve databases', description: error.message } : undefined}
            empty={
                filtered && total > 0
                    ? {
                          title: 'No matching databases',
                          action: (
                              <Button
                                  small
                                  secondary
                                  onClick={() => {
                                      setSearchTerm('')
                                      setOnlyMine(false)
                                  }}
                              >
                                  Clear filters
                              </Button>
                          ),
                      }
                    : { title: 'No databases' }
            }
        />
    )
}
