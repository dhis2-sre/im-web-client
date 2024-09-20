import {
    DataTable,
    DataTableBody,
    DataTableColumnHeader,
    DataTableHead,
    DataTableRow,
    IconDownload16,
    IconEdit16,
    IconCopy16,
    IconDelete16,
    IconFolder16,
    IconDimensionData16,
    IconUserGroup16,
    Tooltip,
    IconChevronDown16,
    IconChevronRight16,
} from '@dhis2/ui'
import { TreeView, TreeItem } from '@mui/x-tree-view'
import type { FC } from 'react'
import { useState } from 'react'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { GroupsWithDatabases } from '../../types/index.ts'
import styles from './databases-list.module.css'
import { UploadButton } from './upload-button.tsx'

interface TreeNode {
    id: string
    name: string
    children?: TreeNode[]
    database?: GroupsWithDatabases['databases'][0]
}

export const DatabasesList: FC = () => {
    const [{ data }, refetch] = useAuthAxios<GroupsWithDatabases[]>('databases', { useCache: false })
    const [expanded, setExpanded] = useState<string[]>([])

    const buildTree = (databases: GroupsWithDatabases['databases']): TreeNode[] => {
        const tree: TreeNode[] = []
        const paths: { [key: string]: TreeNode } = {}

        databases.forEach((db) => {
            const parts = db.name.split('/')
            let currentPath = ''

            parts.forEach((part, index) => {
                currentPath += (currentPath ? '/' : '') + part
                if (!paths[currentPath]) {
                    const newNode: TreeNode = { id: currentPath, name: part }
                    paths[currentPath] = newNode
                    if (index === 0) {
                        tree.push(newNode)
                    } else {
                        const parentPath = parts.slice(0, index).join('/')
                        if (!paths[parentPath].children) {
                            paths[parentPath].children = []
                        }
                        paths[parentPath].children!.push(newNode)
                    }
                }
            })

            paths[currentPath].database = db
        })

        return tree
    }

    const renderTree = (nodes: TreeNode[]) =>
        nodes.map((node) => (
            <TreeItem
                key={node.id}
                itemId={node.id}
                label={
                    <div className={styles.treeRow}>
                        {node.database ? (
                            <>
                                <IconDimensionData16 className={`${styles.icon} ${styles.smallerIcon}`} />
                                <span className={styles.name}>{node.name}</span>
                                <span className={styles.date}>{formatDate(node.database.createdAt)}</span>
                                <span className={styles.date}>{formatDate(node.database.updatedAt)}</span>
                                <div className={styles.actions}>
                                    <Tooltip content="Download">
                                        <IconDownload16 className={`${styles.actionIcon} ${styles.smallerIcon}`} />
                                    </Tooltip>
                                    <Tooltip content="Rename">
                                        <IconEdit16 className={`${styles.actionIcon} ${styles.smallerIcon}`} />
                                    </Tooltip>
                                    <Tooltip content="Copy">
                                        <IconCopy16 className={`${styles.actionIcon} ${styles.smallerIcon}`} />
                                    </Tooltip>
                                    <Tooltip content="Delete">
                                        <IconDelete16 className={`${styles.actionIcon} ${styles.smallerIcon} ${styles.danger}`} />
                                    </Tooltip>
                                </div>
                            </>
                        ) : (
                            <>
                                <IconFolder16 className={`${styles.icon} ${styles.smallerIcon}`} />
                                <span className={styles.name}>{node.name}</span>
                            </>
                        )}
                    </div>
                }
            >
                {node.children && renderTree(node.children)}
            </TreeItem>
        ))

    // Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().split('T')[0]
    }

    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds)
    }

    return (
        <div className={styles.wrapper}>
            <Heading title="Databases">
                <UploadButton onComplete={refetch} />
            </Heading>

            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader className={styles.name}>Database</DataTableColumnHeader>
                        <DataTableColumnHeader className={styles.date}>Created</DataTableColumnHeader>
                        <DataTableColumnHeader className={styles.date}>Updated</DataTableColumnHeader>
                        <DataTableColumnHeader className={styles.actions}>Actions</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {data?.map((group) => (
                        <TreeView
                            key={group.name}
                            defaultCollapseIcon={<IconChevronDown16 className={styles.smallerIcon} /> }
                            defaultExpandIcon={<IconChevronRight16 className={styles.smallerIcon} /> }
                            expanded={expanded}
                            onNodeToggle={handleToggle}
                        >
                            <TreeItem
                                itemId={group.name}
                                label={
                                    <div className={styles.treeRow}>
                                        <IconUserGroup16 className={`${styles.icon} ${styles.smallerIcon}`} />
                                        <span className={styles.name}>{group.name}</span>
                                    </div>
                                }
                            >
                                {renderTree(buildTree(group.databases || []))}
                            </TreeItem>
                        </TreeView>
                    ))}
                </DataTableBody>
            </DataTable>
        </div>
    )
}
