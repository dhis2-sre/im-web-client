import {
    Checkbox,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
    IconFolder16,
} from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import { useEffect, useState } from 'react'
import Moment from 'react-moment'
import { useSearchParams } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { DatabaseRowAction } from './database-row-action.tsx'
import { buildFlattenedList, buildTree, getNodeByPath, Item } from './database-tree-utils.ts'
import styles from './databases-list.module.css'
import useFilterDatabases from './filter-datebase.tsx'
import { Locked } from './locked.tsx'
import { UploadButton } from './upload-button.tsx'

export const DatabasesList = () => {
    const { data, refetch, showOnlyMyDatabases, setShowOnlyMyDatabases } = useFilterDatabases()
    const [searchParams, setSearchParams] = useSearchParams()
    const [currentPaths, setCurrentPaths] = useState<Record<string, string>>({})

    useEffect(() => {
        const pathsStr = searchParams.get('currentPaths')
        if (pathsStr) {
            try {
                setCurrentPaths(JSON.parse(pathsStr))
            } catch (e) {
                console.error('Error parsing currentPaths from search params:', e)
            }
        }
    }, [searchParams])

    const navigateToFolder = (groupName: string, path: string) => {
        const newPaths = { ...currentPaths, [groupName]: path }
        setCurrentPaths(newPaths)
        setSearchParams({ currentPaths: JSON.stringify(newPaths) })
    }

    const renderBreadcrumb = (path: string, groupName: string) => {
        const segments = path.split('/').filter(Boolean)
        return segments.map((segment, index) => {
            const partialPath = segments.slice(0, index + 1).join('/')
            const isLast = index === segments.length - 1
            return (
                <span key={index}>
                    {index > 0 && ' / '}
                    <span style={isLast ? {} : { cursor: 'pointer', textDecoration: 'underline' }} onClick={isLast ? undefined : () => navigateToFolder(groupName, partialPath)}>
                        {segment}
                    </span>
                </span>
            )
        })
    }

    const renderRow = (item: Item, groupName: string) => {
        if (item.type === 'folder') {
            return (
                <DataTableRow key={item.path}>
                    <DataTableCell>
                        <span
                            onClick={() => navigateToFolder(groupName, item.path)}
                            style={{ cursor: 'pointer', paddingLeft: `${item.level * 20}px`, display: 'inline-flex', alignItems: 'center' }}
                        >
                            <IconFolder16 />
                            <span style={{ marginLeft: '4px' }}>{item.name}</span>
                        </span>
                    </DataTableCell>
                    <DataTableCell colSpan="8"></DataTableCell>
                </DataTableRow>
            )
        } else {
            const database = item.database!
            return (
                <DataTableRow key={database.id}>
                    <DataTableCell title={database.id.toString()}>
                        <span style={{ paddingLeft: `${item.level * 20}px` }}>{item.name}</span>
                    </DataTableCell>
                    <DataTableCell>{database.description}</DataTableCell>
                    <DataTableCell>{database.slug}</DataTableCell>
                    <DataTableCell>{prettyBytes(database.size)}</DataTableCell>
                    <DataTableCell>{database.url}</DataTableCell>
                    <DataTableCell>
                        <Moment date={database.createdAt} fromNow />
                    </DataTableCell>
                    <DataTableCell>
                        <Moment date={database.updatedAt} fromNow />
                    </DataTableCell>
                    <DataTableCell>
                        <Locked lock={database.lock} />
                    </DataTableCell>
                    <DataTableCell className={styles.rowPopoverTrigger}>
                        <DatabaseRowAction database={database} groupName={database.groupName} refetch={refetch} />
                    </DataTableCell>
                </DataTableRow>
            )
        }
    }

    return (
        <div className={styles.wrapper}>
            <Heading title="Databases">
                <UploadButton onComplete={refetch} />
                <Checkbox checked={showOnlyMyDatabases} label="Show only my databases" onChange={() => setShowOnlyMyDatabases(!showOnlyMyDatabases)} />
            </Heading>

            {data?.map((group) => {
                const tree = buildTree(group.databases || [])
                const currentPath = currentPaths[group.name] || ''
                const currentNode = getNodeByPath(tree, currentPath)
                const items = buildFlattenedList(currentNode, {}, { level: 0, currentPath })
                return (
                    <div key={group.name}>
                        <TableToolbar className={styles.tabletoolbar}>
                            <h2>
                                <span
                                    style={currentPath ? { cursor: 'pointer', textDecoration: 'underline' } : {}}
                                    onClick={currentPath ? () => navigateToFolder(group.name, '') : undefined}
                                >
                                    {group.name}
                                </span>
                                {currentPath ? ' > ' : ''}
                                {currentPath && renderBreadcrumb(currentPath, group.name)}
                            </h2>
                        </TableToolbar>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Description</DataTableColumnHeader>
                                    <DataTableColumnHeader>Slug</DataTableColumnHeader>
                                    <DataTableColumnHeader>Size</DataTableColumnHeader>
                                    <DataTableColumnHeader>URL</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader>Locked?</DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>
                            </TableHead>
                            <TableBody>
                                {items.length === 0 && (
                                    <DataTableRow>
                                        <DataTableCell colSpan="9">
                                            <h3>No databases</h3>
                                        </DataTableCell>
                                    </DataTableRow>
                                )}
                                {items.map((item) => renderRow(item, group.name))}
                            </TableBody>
                        </DataTable>
                    </div>
                )
            })}
        </div>
    )
}
