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
    IconAdd24,
    IconDownload16,
    IconEdit16,
    IconCopy16,
    IconDelete16,
    Tooltip,
} from '@dhis2/ui'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { SimpleTreeView } from '@mui/x-tree-view'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import type { FC } from 'react'
import { useState, useCallback, useMemo } from 'react'
import { ConfirmationModal } from '../../components/confirmation-modal.tsx'
import { useAuthAxios } from '../../hooks/index.ts'
import { baseURL } from '../../hooks/use-auth-axios.ts'
import { ExternalDownload, GroupsWithDatabases, Database } from '../../types/index.ts'
import styles from './databases-list.module.css'

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
    const [{ data, refetch }] = useAuthAxios<GroupsWithDatabases[]>('databases', { useCache: false })
    const [selectedPath, setSelectedPath] = useState<string | null>(null)
    const [expanded, setExpanded] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')

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

            return contents
        },
        [filteredData, folderTree]
    )

    const selectedContents = useMemo(() => getSelectedContents(selectedPath), [getSelectedContents, selectedPath])

    const handleSelect = useCallback((nodeId: string) => {
        console.log('handleSelect called with nodeId:', nodeId)
        setSelectedPath(nodeId)
        const parts = nodeId.split('/')
        const newExpanded = new Set<string>()
        let currentPath = ''
        for (const part of parts) {
            currentPath += (currentPath ? '/' : '') + part
            newExpanded.add(currentPath)
        }
        console.log('newExpanded:', newExpanded)
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
                    <Button icon={<IconAdd24 />} className={styles.uploadButton}>
                        Upload database
                    </Button>
                </div>
                <h2>{selectedPath || 'My groups'}</h2>
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader
                            // name="Name"
                            // onSortIconClick={function zA(){}}
                            // sortDirection="default"
                            // sortIconTitle="Sort by name"
                            >
                                Name
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                            // name="Size"
                            // onSortIconClick={function zA(){}}
                            // sortDirection="default"
                            // sortIconTitle="Sort by size"
                            >
                                Size
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                            // name="Created"
                            // onSortIconClick={function zA(){}}
                            // sortDirection="default"
                            // sortIconTitle="Sort by created"
                            >
                                Created
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                            // name="Last Updated"
                            // onSortIconClick={function zA(){}}
                            // sortDirection="default"
                            // sortIconTitle="Sort by last updated"
                            >
                                Last Updated
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>Actions</DataTableColumnHeader>
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {selectedContents.map((item) => (
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
                                    {item.name}
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
                                                    <Button icon={<IconEdit16 />} onClick={() => handleAction('rename', item)} className={styles.iconButton} />
                                                </Tooltip>
                                                <Tooltip content="Copy">
                                                    <Button icon={<IconCopy16 />} onClick={() => handleAction('copy', item)} className={styles.iconButton} />
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
        </div>
    )
}

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]
}