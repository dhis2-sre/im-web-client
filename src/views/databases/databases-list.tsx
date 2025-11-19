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
import { useState } from 'react'
import Moment from 'react-moment'
import { Heading } from '../../components/index.ts'
import { DatabaseRowAction } from './database-row-action.tsx'
import { buildTree, buildFlattenedList, getNodeByPath, Item } from './database-tree-utils.ts'
import styles from './databases-list.module.css'
import useFilterDatabases from './filter-datebase.tsx'
import { Locked } from './locked.tsx'
import { UploadButton } from './upload-button.tsx'

export const DatabasesList = () => {
    const { data, refetch, showOnlyMyDatabases, setShowOnlyMyDatabases } = useFilterDatabases()
    const [currentPaths, setCurrentPaths] = useState<Record<string, string>>({})

    const navigateToFolder = (groupName: string, path: string) => {
        setCurrentPaths((prev) => ({ ...prev, [groupName]: path }))
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
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                    <DataTableCell></DataTableCell>
                </DataTableRow>
            )
        } else {
            const database = item.database!
            return (
                <DataTableRow key={database.id}>
                    <DataTableCell title={database.id.toString()}>
                        <span style={{ paddingLeft: `${item.level * 20}px` }}>{database.name}</span>
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
                            <h2
                                style={currentPath ? { cursor: 'pointer', textDecoration: 'underline' } : {}}
                                onClick={currentPath ? () => setCurrentPaths((prev) => ({ ...prev, [group.name]: '' })) : undefined}
                            >
                                {group.name}
                                {currentPath ? ` / ${currentPath}` : ''}
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
