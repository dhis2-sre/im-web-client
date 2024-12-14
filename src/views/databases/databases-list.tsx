import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    IconFolder16,
    IconDimensionData16,
    IconUserGroup16,
    Button,
    IconEdit16,
    IconCopy16,
    Tooltip,
} from '@dhis2/ui'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { SimpleTreeView } from '@mui/x-tree-view'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import { orderBy } from 'lodash'
import type { FC } from 'react'
import { useState, useCallback, useMemo } from 'react'
// import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { CopyDatabaseModal } from './copy-database-modal.tsx'
import styles from './databases-list.module.css'
import { DeleteButton } from './delete-button.tsx'
import { DownloadButton } from './download-button.tsx'
import { RenameModal } from './rename-modal.tsx'
import { UploadButton } from './upload-button.tsx'
import { UploadDatabaseModal } from './upload-database-modal.tsx'
import { GroupsWithDatabases } from '../../types/index.ts'

interface TreeNode {
    id: string
    name: string
    children?: TreeNode[]
    isGroup?: boolean
    isFolder?: boolean
}

interface Database {
    id: string
    name: string
    groupName?: string
    // ... other properties
}

const buildTree = (groups: GroupsWithDatabases[]): TreeNode[] => {
    return groups
        .map((group) => {
            if (!group.name) {
                console.error('Group without name:', group)
                return null
            }
            return {
                id: `${group.name}`,
                name: group.name,
                isGroup: true,
                children: buildGroupTree(group.databases || [], `${group.name}`),
            }
        })
        .filter(Boolean) as TreeNode[]
}

const buildGroupTree = (databases: GroupsWithDatabases['databases'], groupPrefix: string): TreeNode[] => {
    const tree: TreeNode[] = []
    const map: Record<string, TreeNode> = {}

    databases.forEach((db) => {
        if (!db.name) {
            console.error('Database without name:', db)
            return
        }
        const parts = db.name.split('/')
        let currentLevel = tree
        let currentPath = groupPrefix

        parts.slice(0, -1).forEach((part) => {
            currentPath += '/' + part
            if (!map[currentPath]) {
                const newNode: TreeNode = {
                    id: currentPath,
                    name: part,
                    children: [],
                    isFolder: true,
                }
                map[currentPath] = newNode
                currentLevel.push(newNode)
            }
            currentLevel = map[currentPath].children!
        })
    })

    return tree
}

export const DatabasesList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', { useCache: false })
    const [selectedPath, setSelectedPath] = useState('')
    const [expanded, setExpanded] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false)
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [renameModalData, setRenameModalData] = useState<{ id: string; name: string } | null>(null)
    const [copyModalData, setCopyModalData] = useState<{ id: string; name: string; group: string } | null>(null)

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) {
            return data || []
        }
        return (
            data
                ?.map((group) => ({
                    ...group,
                    databases: group.databases?.filter((db) => (db.fullPath + '/' + db.name).toLowerCase().includes(searchTerm.toLowerCase())),
                }))
                .filter((group) => group.databases && group.databases.length > 0) || []
        )
    }, [data, searchTerm])

    const folderTree = useMemo(() => buildTree(filteredData), [filteredData])

    const getSelectedContents = useCallback(
        (path: string | null): (TreeNode | GroupsWithDatabases['databases'][0])[] => {
            if (!path) {
                return folderTree
            }

            const allDatabases = filteredData.flatMap((group) => group.databases || [])
            const contents: (TreeNode | GroupsWithDatabases['databases'][0])[] = []
            const folders: Record<string, TreeNode> = {}

            allDatabases.forEach((db) => {
                const dbFullPath = `${db.groupName}/${db.name}`
                // console.log('Checking database:', dbFullPath, 'against path:', path);
                if (dbFullPath.startsWith(path + '/')) {
                    const relativePath = dbFullPath.slice(path.length + 1)
                    const parts = relativePath.split('/')
                    if (parts.length === 1) {
                        contents.push(db)
                    } else {
                        const folderName = parts[0]
                        const folderPath = `${path}/${folderName}`
                        if (!folders[folderPath]) {
                            folders[folderPath] = { id: folderPath, name: folderName, children: [], isFolder: true }
                            contents.push(folders[folderPath])
                        }
                    }
                }
            })

            // Sort the contents
            return orderBy(
                contents,
                [
                    (item) => 'children' in item, // Folders first
                    (item) => ('url' in item ? item.url.toLowerCase() : item.name.toLowerCase()), // Then sort by url or name
                ],
                ['desc', 'asc']
            )
        },
        [filteredData, folderTree]
    )

    const selectedContents = useMemo(() => getSelectedContents(selectedPath), [getSelectedContents, selectedPath])

    const sortedSelectedContents = useMemo(() => {
        if (!sortColumn) {
            return selectedContents
        }

        return [...selectedContents].sort((a, b) => {
            if ('children' in a || 'children' in b) {
                return 0
            } // Don't sort folders

            const aDatabase = a as Database
            const bDatabase = b as Database

            let aValue: string | number | Date = aDatabase[sortColumn as keyof Database]
            let bValue: string | number | Date = bDatabase[sortColumn as keyof Database]

            if (sortColumn === 'name') {
                aValue = (aDatabase.name.split('/').pop() || '').toLowerCase()
                bValue = (bDatabase.name.split('/').pop() || '').toLowerCase()
            } else if (sortColumn === 'size') {
                aValue = typeof aValue === 'string' ? parseInt(aValue) || 0 : aValue
                bValue = typeof bValue === 'string' ? parseInt(bValue) || 0 : bValue
            } else if (sortColumn === 'createdAt' || sortColumn === 'updatedAt') {
                aValue = aValue instanceof Date ? aValue : new Date(aValue as string)
                bValue = bValue instanceof Date ? bValue : new Date(bValue as string)
            }

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1
            }
            return 0
        })
    }, [selectedContents, sortColumn, sortDirection])

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const handleSelect = useCallback((nodeId: string) => {
        setSelectedPath(nodeId)
        const parts = nodeId.split('/')
        const newExpanded = new Set<string>()
        let currentPath = ''
        for (const part of parts) {
            currentPath += (currentPath ? '/' : '') + part
            newExpanded.add(currentPath)
        }
        setExpanded(Array.from(newExpanded))
    }, [])

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }

    const handleRightPanelSelect = useCallback(
        (item: TreeNode | GroupsWithDatabases['databases'][0]) => {
            if ('children' in item) {
                // For folders
                const nodeId = item.id;
                console.log('Double-clicked folder:', nodeId);
                
                // Expand all parent folders
                const parts = nodeId.split('/');
                const newExpanded = new Set<string>(expanded); // Keep currently expanded nodes
                let currentPath = '';
                
                for (const part of parts) {
                    currentPath += (currentPath ? '/' : '') + part;
                    newExpanded.add(currentPath);
                    console.log('Adding to expanded:', currentPath);
                }
                
                const newExpandedArray = Array.from(newExpanded);
                console.log('Setting expanded to:', newExpandedArray);
                setExpanded(newExpandedArray);
                handleSelect(nodeId);
            }
        },
        [expanded, handleSelect]
    );

    // const { show: showError } = useAlert(({ message }) => message, { critical: true })

    // const { show: showAlert } = useAlert(
    //     ({ message }) => message,
    //     ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    // )

    const renderTree = (nodes: TreeNode[]) =>
        nodes
            .map((node) => {
                if (!node.id) {
                    return null
                }
                return (
                    <TreeItem
                        key={node.id}
                        itemId={node.id}
                        label={
                            <div 
                                className={`${styles.treeRow} ${selectedPath === node.id ? styles.selected : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent event from bubbling up
                                    handleSelect(node.id);
                                }}
                            >
                                {node.isGroup ? <IconUserGroup16 /> : <IconFolder16 />}
                                <span>{node.name}</span>
                            </div>
                        }
                    >
                        {Array.isArray(node.children) && node.children.length > 0 && renderTree(node.children)}
                    </TreeItem>
                )
            })
            .filter(Boolean)

    const renderBreadcrumb = (path: string | null) => {
        if (!path) {
            return (
                <Breadcrumbs aria-label="breadcrumb">
                    <Typography color="text.primary">My groups</Typography>
                </Breadcrumbs>
            )
        }

        const parts = path.split('/')
        const group = data?.find((g) => g.databases?.some((db) => db.name.startsWith(path)))

        return (
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" onClick={() => handleSelect('')}>
                    My groups
                </Link>
                {group && (
                    <Link color="inherit" onClick={() => handleSelect(group.name)}>
                        {group.name} (Group)
                    </Link>
                )}
                {parts.map((part, index) => {
                    const currentPath = parts.slice(0, index + 1).join('/')
                    return index === parts.length - 1 ? (
                        <Typography key={index} color="text.primary">
                            {part}
                        </Typography>
                    ) : (
                        <Link key={index} color="inherit" onClick={() => handleSelect(currentPath)}>
                            {part}
                        </Link>
                    )
                })}
            </Breadcrumbs>
        )
    }

    const handleRename = useCallback((item: Database) => {
        setRenameModalData({ id: item.id, name: item.name })
    }, [])

    const handleCopy = useCallback((item: Database) => {
        setCopyModalData({ id: item.id, name: item.name, group: item.groupName })
    }, [])

    const handleAction = useCallback(
        (action: string, item: Database) => {
            switch (action) {
                case 'rename':
                    handleRename(item)
                    break
                case 'copy':
                    handleCopy(item)
                    break
                default:
                    console.warn(`Unknown action: ${action}`)
            }
        },
        [handleRename, handleCopy]
    )

    // Modify this callback function to handle successful uploads
    const handleUploadSuccess = useCallback(() => {
        // Check if refetch is a function before calling it
        if (typeof refetch === 'function') {
            refetch()
        } else {
            console.warn('refetch is not a function, unable to refresh database list')
            // Optionally, you could implement a fallback refresh method here
        }
    }, [refetch])

    // const handleOpenUploadModal = () => {
    //     setIsUploadModalVisible(true)
    // }

    const handleCloseUploadModal = () => {
        setIsUploadModalVisible(false)
    }

    const handleUploadComplete = () => {
        handleCloseUploadModal()
        handleUploadSuccess()
    }

    const isPathSelected = selectedPath !== '' && selectedPath !== 'my groups'

    const handleRenameComplete = useCallback(() => {
        setRenameModalData(null)
        refetch()
    }, [refetch])

    const handleCopyComplete = useCallback(() => {
        setCopyModalData(null)
        refetch()
    }, [refetch])

    // Get unique groups from the data
    const groups = useMemo(() => [...new Set(data?.map((group) => group.name))], [data])

    const renderActionButtons = useCallback(
        (item: TreeNode | Database) => {
            // Don't render action buttons for folders or groups
            if ('children' in item || item.isGroup || item.isFolder) {
                return null
            }

            // Type guard to ensure we have a Database object
            if (!('id' in item)) {
                return null
            }

            return (
                <div className={styles.actionIcons}>
                    <Tooltip content="Download">
                        <DownloadButton database={item} className={styles.iconButton} />
                    </Tooltip>
                    <Tooltip content="Rename/Move...">
                        <Button icon={<IconEdit16 />} onClick={() => handleAction('rename', item)} className={styles.iconButton} />
                    </Tooltip>
                    <Tooltip content="Copy...">
                        <Button icon={<IconCopy16 />} onClick={() => handleAction('copy', item)} className={styles.iconButton} />
                    </Tooltip>
                    <Tooltip content="Delete...">
                        <DeleteButton database={item} onComplete={refetch} />
                    </Tooltip>
                </div>
            )
        },
        [handleAction, refetch]
    )

    return (
        <div className={styles.twoPanel}>
            <div className={styles.leftPanel}>
                <input type="text" placeholder="Filter databases..." className={styles.searchInput} value={searchTerm} onChange={handleSearch} />
                {folderTree.length > 0 ? (
                    <SimpleTreeView 
                        expanded={expanded} 
                        selected={selectedPath}
                        onNodeToggle={(event: React.SyntheticEvent, nodeIds: string[]) => {
                            setExpanded(nodeIds);
                        }}
                    >
                        {renderTree(folderTree)}
                    </SimpleTreeView>
                ) : (
                    <p>No data available</p>
                )}
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.topBar}>
                    {renderBreadcrumb(selectedPath)}
                    {/* Replace the existing Button with UploadButton */}
                    <UploadButton groupName={selectedPath?.split('/')[0] || ''} path={selectedPath || ''} onUploadSuccess={handleUploadSuccess} disabled={!isPathSelected} />
                </div>
                <h2>{selectedPath || 'My groups'}</h2>
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader onSortIconClick={() => handleSort('name')} sortDirection={sortColumn === 'name' ? sortDirection : 'default'} name="Name">
                                Name
                            </DataTableColumnHeader>
                            <DataTableColumnHeader onSortIconClick={() => handleSort('size')} sortDirection={sortColumn === 'size' ? sortDirection : 'default'} name="Size">
                                Size
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                                onSortIconClick={() => handleSort('createdAt')}
                                sortDirection={sortColumn === 'createdAt' ? sortDirection : 'default'}
                                name="Created"
                            >
                                Created
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                                onSortIconClick={() => handleSort('updatedAt')}
                                sortDirection={sortColumn === 'updatedAt' ? sortDirection : 'default'}
                                name="Last Updated"
                            >
                                Last Updated
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>Actions</DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {sortedSelectedContents.map((item) => (
                            <DataTableRow 
                                key={item.id || item.name} 
                                onDoubleClick={() => handleRightPanelSelect(item)}  // Make sure this is here
                            >
                                <DataTableCell>
                                    {(() => {
                                        if ('children' in item) {
                                            if (item.isGroup) {
                                                return (
                                                    <span className={styles.iconWithSpace}>
                                                        <IconUserGroup16 />
                                                    </span>
                                                )
                                            } else {
                                                return (
                                                    <span className={styles.iconWithSpace}>
                                                        <IconFolder16 />
                                                    </span>
                                                )
                                            }
                                        } else {
                                            return (
                                                <span className={styles.iconWithSpace}>
                                                    <IconDimensionData16 />
                                                </span>
                                            )
                                        }
                                    })()}
                                    {'name' in item ? item.name.split('/').pop() : item.name}
                                </DataTableCell>
                                <DataTableCell>{'size' in item ? item.size || '-' : ''}</DataTableCell>
                                <DataTableCell>{'createdAt' in item ? formatDate(item.createdAt) : ''}</DataTableCell>
                                <DataTableCell>{'updatedAt' in item ? formatDate(item.updatedAt) : ''}</DataTableCell>
                                <DataTableCell>{renderActionButtons(item)}</DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
            {isUploadModalVisible && <UploadDatabaseModal onClose={handleCloseUploadModal} onComplete={handleUploadComplete} currentPath={selectedPath?.split('/')[0] || ''} />}
            {renameModalData && (
                <RenameModal databaseId={renameModalData.id} currentName={renameModalData.name} onClose={() => setRenameModalData(null)} onComplete={handleRenameComplete} />
            )}
            {copyModalData && (
                <CopyDatabaseModal
                    databaseId={copyModalData.id}
                    currentName={copyModalData.name}
                    currentGroup={copyModalData.group}
                    groups={groups}
                    onClose={() => setCopyModalData(null)}
                    onComplete={handleCopyComplete}
                />
            )}
        </div>
    )
}

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]
}
