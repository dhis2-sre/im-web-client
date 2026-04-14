import {
    Checkbox,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
    IconFileDocument24,
    IconFolder16,
    InputField,
} from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import { useState } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { Database } from '../../types/index.ts'
import { DatabaseRowAction } from './database-row-action.tsx'
import { buildFlattenedList, buildTree, getNodeByPath, Item } from './database-tree-utils.ts'
import styles from './databases-list.module.css'
import useFilterDatabases from './filter-datebase.tsx'
import { Locked } from './locked.tsx'
import { UploadButton } from './upload-button.tsx'

type SortField = 'name' | 'description' | 'size' | 'url' | 'created' | 'updated' | 'locked' | 'filestore'
type SortDirection = 'asc' | 'desc'

const VIEW_MODE_KEY = 'databaseViewMode'

export const DatabasesList = () => {
    const { data, refetch, showOnlyMyDatabases, setShowOnlyMyDatabases, searchTerm, setSearchTerm } = useFilterDatabases()
    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [treeView, setTreeView] = useState<boolean>(() => localStorage.getItem(VIEW_MODE_KEY) === 'hierarchy')
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const [currentPath, setCurrentPath] = useState('')
    const navigate = useNavigate()

    const toggleViewMode = () => {
        setTreeView((prev) => {
            const next = !prev
            localStorage.setItem(VIEW_MODE_KEY, next ? 'hierarchy' : 'flat')
            return next
        })
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const compareByField = (a: { db?: Database; name?: string }, b: { db?: Database; name?: string }) => {
        const dbA = a.db
        const dbB = b.db
        switch (sortField) {
            case 'name':
                return (a.name ?? dbA?.name ?? '').localeCompare(b.name ?? dbB?.name ?? '')
            case 'description':
                return (dbA?.description ?? '').localeCompare(dbB?.description ?? '')
            case 'size':
                return (dbA?.size ?? 0) - (dbB?.size ?? 0)
            case 'url':
                return (dbA?.url ?? '').localeCompare(dbB?.url ?? '')
            case 'created':
                return (dbA?.createdAt ?? '').localeCompare(dbB?.createdAt ?? '')
            case 'updated':
                return (dbA?.updatedAt ?? '').localeCompare(dbB?.updatedAt ?? '')
            case 'locked':
                return Number(!!dbA?.lock) - Number(!!dbB?.lock)
            case 'filestore':
                return Number(!!dbA?.filestoreId) - Number(!!dbB?.filestoreId)
            default:
                return 0
        }
    }

    const sortItems = (items: Item[]) => {
        if (!sortField) {
            return items
        }
        const folders = items.filter((i) => i.type === 'folder')
        const files = items.filter((i) => i.type === 'file')
        files.sort((a, b) => {
            const cmp = compareByField({ db: a.database, name: a.name }, { db: b.database, name: b.name })
            return sortDirection === 'asc' ? cmp : -cmp
        })
        return [...folders, ...files]
    }

    const sortDatabases = (databases: Database[]) => {
        if (!sortField) {
            return databases
        }
        return [...databases].sort((a, b) => {
            const cmp = compareByField({ db: a }, { db: b })
            return sortDirection === 'asc' ? cmp : -cmp
        })
    }

    const navigateToFolder = (path: string) => {
        setCurrentPath(path)
    }

    const navigateToGroup = (groupName: string) => {
        setSelectedGroup(groupName)
        setCurrentPath('')
    }

    const navigateToRoot = () => {
        setSelectedGroup(null)
        setCurrentPath('')
    }

    const renderTreeBreadcrumb = () => {
        if (!selectedGroup) {
            return (
                <TableToolbar className={styles.tabletoolbar}>
                    <h2 className={styles.groupName}>Groups</h2>
                </TableToolbar>
            )
        }
        const segments = currentPath.split('/').filter(Boolean)
        return (
            <TableToolbar className={styles.tabletoolbar}>
                <h2 className={styles.groupName}>
                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={navigateToRoot}>
                        Groups
                    </span>
                    {' > '}
                    <span style={currentPath ? { cursor: 'pointer', textDecoration: 'underline' } : {}} onClick={currentPath ? () => navigateToFolder('') : undefined}>
                        {selectedGroup}
                    </span>
                    {segments.map((segment, index) => {
                        const partialPath = segments.slice(0, index + 1).join('/')
                        const isLast = index === segments.length - 1
                        return (
                            <span key={index}>
                                {' > '}
                                <span style={isLast ? {} : { cursor: 'pointer', textDecoration: 'underline' }} onClick={isLast ? undefined : () => navigateToFolder(partialPath)}>
                                    {segment}
                                </span>
                            </span>
                        )
                    })}
                </h2>
            </TableToolbar>
        )
    }

    const renderDatabaseCells = (database: Database) => {
        const onClick = () => navigate(`/databases/${database.id}`)
        return (
            <>
                <DataTableCell staticStyle onClick={onClick}>
                    {database.description}
                </DataTableCell>
                <DataTableCell staticStyle onClick={onClick}>
                    <span title={`${database.size.toLocaleString()} bytes`}>{prettyBytes(database.size)}</span>
                </DataTableCell>
                <DataTableCell staticStyle onClick={onClick}>
                    {database.url}
                </DataTableCell>
                <DataTableCell staticStyle onClick={onClick}>
                    <span title={database.createdAt}>
                        <Moment date={database.createdAt} fromNow />
                    </span>
                </DataTableCell>
                <DataTableCell staticStyle onClick={onClick}>
                    <span title={database.updatedAt}>
                        <Moment date={database.updatedAt} fromNow />
                    </span>
                </DataTableCell>
                <DataTableCell staticStyle onClick={onClick}>
                    <Locked lock={database.lock} />
                </DataTableCell>
                <DataTableCell staticStyle onClick={onClick}>
                    {database.filestoreId !== 0 && <IconFileDocument24 />}
                </DataTableCell>
                <DataTableCell staticStyle align="right">
                    <DatabaseRowAction database={database} groupName={database.groupName} refetch={refetch} />
                </DataTableCell>
            </>
        )
    }

    const renderHierarchyRow = (item: Item) => {
        if (item.type === 'folder') {
            return (
                <DataTableRow key={item.path}>
                    <DataTableCell>
                        <span onClick={() => navigateToFolder(item.path)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                            <IconFolder16 />
                            <span style={{ marginLeft: '4px' }}>{item.name}</span>
                        </span>
                    </DataTableCell>
                    <DataTableCell colSpan="9"></DataTableCell>
                </DataTableRow>
            )
        }
        const database = item.database!
        return (
            <tr className={styles.clickableRow} key={database.id}>
                <DataTableCell staticStyle onClick={() => navigate(`/databases/${database.id}`)}>
                    {item.name}
                </DataTableCell>
                {renderDatabaseCells(database)}
            </tr>
        )
    }

    const renderFlatRow = (database: Database) => {
        return (
            <tr className={styles.clickableRow} key={database.id}>
                <DataTableCell staticStyle onClick={() => navigate(`/databases/${database.id}`)}>
                    {database.name}
                </DataTableCell>
                {renderDatabaseCells(database)}
            </tr>
        )
    }

    const renderTableHeader = () => (
        <TableHead>
            <DataTableRow>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('name')}>
                        Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('description')}>
                        Description {sortField === 'description' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('size')}>
                        Size {sortField === 'size' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('url')}>
                        URL {sortField === 'url' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('created')}>
                        Created {sortField === 'created' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('updated')}>
                        Updated {sortField === 'updated' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('locked')}>
                        Locked? {sortField === 'locked' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader>
                    <span className={styles.sortableHeader} onClick={() => handleSort('filestore')}>
                        FS {sortField === 'filestore' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </span>
                </DataTableColumnHeader>
                <DataTableColumnHeader></DataTableColumnHeader>
            </DataTableRow>
        </TableHead>
    )

    const renderEmptyRow = () => (
        <DataTableRow>
            <DataTableCell colSpan="9">
                <h3>No databases</h3>
            </DataTableCell>
        </DataTableRow>
    )

    const renderTreeView = () => {
        if (!selectedGroup) {
            return (
                <DataTable>
                    {renderTableHeader()}
                    <TableBody>
                        {(!data || data.length === 0) && renderEmptyRow()}
                        {data?.map((group) => (
                            <DataTableRow key={group.name}>
                                <DataTableCell>
                                    <span onClick={() => navigateToGroup(group.name)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                                        <IconFolder16 />
                                        <span style={{ marginLeft: '4px' }}>{group.name}</span>
                                    </span>
                                </DataTableCell>
                                <DataTableCell colSpan="9"></DataTableCell>
                            </DataTableRow>
                        ))}
                    </TableBody>
                </DataTable>
            )
        }

        const group = data?.find((g) => g.name === selectedGroup)
        const databases = group?.databases || []
        const tree = buildTree(databases)
        const currentNode = getNodeByPath(tree, currentPath)
        const items = sortItems(buildFlattenedList(currentNode, { level: 0, currentPath }))

        return (
            <DataTable>
                {renderTableHeader()}
                <TableBody>
                    {items.length === 0 && renderEmptyRow()}
                    {items.map((item) => renderHierarchyRow(item))}
                </TableBody>
            </DataTable>
        )
    }

    const renderFlatView = () => (
        <>
            {data?.map((group) => {
                const flatDatabases = sortDatabases(group.databases || [])
                return (
                    <div key={group.name}>
                        <TableToolbar className={styles.tabletoolbar}>
                            <h2 className={styles.groupName}>{group.name}</h2>
                        </TableToolbar>
                        <DataTable>
                            {renderTableHeader()}
                            <TableBody>
                                {flatDatabases.length === 0 && renderEmptyRow()}
                                {flatDatabases.map((db) => renderFlatRow(db))}
                            </TableBody>
                        </DataTable>
                    </div>
                )
            })}
        </>
    )

    return (
        <div className={styles.wrapper}>
            <Heading title="Databases">
                <UploadButton onComplete={refetch} />
                <Checkbox checked={showOnlyMyDatabases} label="Show only my databases" onChange={() => setShowOnlyMyDatabases(!showOnlyMyDatabases)} />
                <Checkbox checked={treeView} label="Tree view" onChange={toggleViewMode} />
                <InputField placeholder="Search databases..." value={searchTerm} onChange={({ value }) => setSearchTerm(value)} dense className={styles.searchInput} />
            </Heading>

            {treeView && renderTreeBreadcrumb()}
            {treeView ? renderTreeView() : renderFlatView()}
        </div>
    )
}
