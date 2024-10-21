import { useAlert } from '@dhis2/app-service-alerts'
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
    IconDownload16,
    IconEdit16,
    IconCopy16,
    IconDelete16,
    Tooltip,
} from '@dhis2/ui'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { SimpleTreeView } from '@mui/x-tree-view'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import { orderBy } from 'lodash'
import type { FC } from 'react'
import { useState, useCallback, useMemo } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { baseURL } from '../../hooks/use-auth-axios.ts'
import { ExternalDownload, GroupsWithDatabases, Database, TreeNode } from '../../types/index.ts'
import { CopyDatabaseModal } from './copy-database-modal.tsx'
import styles from './databases-list.module.css'
import { RenameModal } from './rename-modal.tsx'
import { UploadButton } from './upload-button.tsx'
import { UploadDatabaseModal } from './upload-database-modal.tsx'

interface TreeNode {
    id: string
    name: string
    children?: TreeNode[]
    isGroup?: boolean
    isFolder?: boolean
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
                handleSelect(item.id)
            }
        },
        [handleSelect]
    )

    const { show: showError } = useAlert('Could not retrieve database UID', { critical: true })
    const [{ loading }, fetchDownloadLink] = useAuthAxios<ExternalDownload>(
        {
            url: '/databases/:id/external',
            method: 'post',
            data: {
                expiration: 5,
            },
        },
        { manual: true }
    )
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [databaseToDelete, setDatabaseToDelete] = useState<string | null>(null)
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [{ loading: deleteLoading }, deleteDatabase] = useAuthAxios<Database>(
        {
            url: '/databases/:id',
            method: 'delete',
        },
        { manual: true }
    )

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
                            <div className={`${styles.treeRow} ${selectedPath === node.id ? styles.selected : ''}`}>
                                {node.isGroup ? <IconUserGroup16 /> : <IconFolder16 />}
                                <span>{node.name}</span>
                            </div>
                        }
                        onClick={() => handleSelect(node.id)}
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

    const handleDownload = useCallback(
        async (databaseId: string) => {
            try {
                const { data } = await fetchDownloadLink({
                    url: `/databases/${databaseId}/external`,
                    method: 'post',
                    data: {
                        expiration: 5,
                    },
                })
                if (data && data.uuid) {
                    const link = document.createElement('a')
                    link.href = `${baseURL}/databases/external/${data.uuid}`
                    link.target = '_blank'
                    link.click()
                    link.remove()
                } else {
                    throw new Error('No UUID received from server')
                }
            } catch (error) {
                console.error('Download error:', error)
                showError()
            }
        },
        [fetchDownloadLink, showError]
    )

    const handleDeleteConfirmation = useCallback((databaseId: string) => {
        setDatabaseToDelete(databaseId)
        setShowConfirmationModal(true)
    }, [])

    const handleDeleteCancel = useCallback(() => {
        setShowConfirmationModal(false)
        setDatabaseToDelete(null)
    }, [])

    const handleDeleteConfirm = useCallback(async () => {
        if (!databaseToDelete) {
            return
        }

        try {
            setShowConfirmationModal(false)
            await deleteDatabase({ url: `/databases/${databaseToDelete}` })
            showAlert({ message: `Successfully deleted database`, isCritical: false })
            // Refetch the database list
            refetch()
        } catch (error) {
            console.error(error)
            showAlert({ message: `There was an error when deleting database`, isCritical: true })
        } finally {
            setDatabaseToDelete(null)
        }
    }, [databaseToDelete, deleteDatabase, showAlert, refetch])

    const handleAction = (action: string, item: GroupsWithDatabases['databases'][0]) => {
        switch (action) {
            case 'download':
                handleDownload(item.id)
                break
            case 'rename':
                console.log(`Rename action for item ${item.id}`)
                break
            case 'copy':
                console.log(`Copy action for item ${item.id}`)
                break
            case 'delete':
                handleDeleteConfirmation(item.id)
                break
            default:
                console.log(`Unknown action ${action} for item ${item.id}`)
        }
    }

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

    const handleRename = useCallback((item: GroupsWithDatabases['databases'][0]) => {
        setRenameModalData({ id: item.id, name: item.name })
    }, [])

    const handleRenameComplete = useCallback(() => {
        setRenameModalData(null)
        refetch()
    }, [refetch])

    const handleCopy = useCallback((item: GroupsWithDatabases['databases'][0]) => {
        setCopyModalData({ id: item.id, name: item.name, group: item.groupName })
    }, [])

    const handleCopyComplete = useCallback(() => {
        setCopyModalData(null)
        refetch()
    }, [refetch])

    // Get unique groups from the data
    const groups = useMemo(() => [...new Set(data?.map((group) => group.name))], [data])

    return (
        <div className={styles.twoPanel}>
            <div className={styles.leftPanel}>
                <input type="text" placeholder="Filter databases..." className={styles.searchInput} value={searchTerm} onChange={handleSearch} />
                {folderTree.length > 0 ? (
                    <SimpleTreeView
                        expanded={expanded}
                        onExpanded={(nodeIds) => {
                            console.log('Nodes expanded:', nodeIds)
                            setExpanded(nodeIds)
                        }}
                        selected={selectedPath}
                        onSelected={(nodeId) => {
                            console.log('Node selected phil:', nodeId)
                            handleSelect(nodeId)
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
                            <DataTableRow key={'id' in item ? item.id : item.name} onDoubleClick={() => ('children' in item ? handleRightPanelSelect(item) : null)}>
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
                                <DataTableCell>{'size' in item ? item.size || '-' : '-'}</DataTableCell>
                                <DataTableCell>{'createdAt' in item ? formatDate(item.createdAt) : '-'}</DataTableCell>
                                <DataTableCell>{'updatedAt' in item ? formatDate(item.updatedAt) : '-'}</DataTableCell>
                                <DataTableCell>
                                    <div className={styles.actionIcons}>
                                        {'id' in item && (
                                            <>
                                                <Tooltip content="Download">
                                                    <Button
                                                        icon={<IconDownload16 />}
                                                        onClick={() => handleAction('download', item)}
                                                        className={styles.iconButton}
                                                        loading={loading}
                                                    />
                                                </Tooltip>
                                                <Tooltip content="Rename">
                                                    <Button icon={<IconEdit16 />} onClick={() => handleRename(item)} className={styles.iconButton} />
                                                </Tooltip>
                                                <Tooltip content="Copy">
                                                    <Button icon={<IconCopy16 />} onClick={() => handleCopy(item)} className={styles.iconButton} />
                                                </Tooltip>
                                                <Tooltip content="Delete">
                                                    <Button
                                                        icon={<IconDelete16 />}
                                                        onClick={() => handleAction('delete', item)}
                                                        className={`${styles.iconButton} ${styles.danger}`}
                                                        loading={deleteLoading && databaseToDelete === item.id}
                                                    />
                                                </Tooltip>
                                            </>
                                        )}
                                    </div>
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
            {showConfirmationModal && (
                <ConfirmationModal destructive onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel}>
                    Are you sure you wish to delete this database?
                </ConfirmationModal>
            )}
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
