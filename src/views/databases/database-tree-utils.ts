import { Database } from '../../types/index.ts'

export interface TreeNode {
    name: string
    isFolder: boolean
    children?: Map<string, TreeNode>
    database?: Database
}

export interface Item {
    type: 'folder' | 'file'
    name: string
    path: string
    level: number
    database?: Database
}

export const buildTree = (databases: Database[]): TreeNode => {
    const root: TreeNode = { name: '', isFolder: true, children: new Map() }

    for (const db of databases) {
        const parts = db.name?.split('/') || []
        let current = root
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            if (!current.children) {
                current.children = new Map()
            }
            if (!current.children.has(part)) {
                current.children.set(part, {
                    name: part,
                    isFolder: i < parts.length - 1,
                    children: new Map(),
                })
            }
            current = current.children.get(part)!
        }
        current.database = db
    }

    return root
}

export const getNodeByPath = (root: TreeNode, path: string): TreeNode => {
    if (!path) {
        return root
    }
    const parts = path.split('/')
    let current = root
    for (const part of parts) {
        if (current.children && current.children.has(part)) {
            current = current.children.get(part)!
        } else {
            return root
        }
    }
    return current
}

export const buildFlattenedList = (node: TreeNode, expanded: Record<string, boolean>, options: { level?: number; currentPath?: string } = {}): Item[] => {
    const { level = 0, currentPath = '' } = options
    const items: Item[] = []

    if (node.children) {
        Array.from(node.children).forEach(([name, child]) => {
            const path = currentPath ? `${currentPath}/${name}` : name
            items.push({
                type: child.isFolder ? 'folder' : 'file',
                name: child.isFolder ? `${name}/` : name,
                path,
                level,
                database: child.database,
            })
            if (child.isFolder && expanded[path]) {
                items.push(...buildFlattenedList(child, expanded, { level: level + 1, currentPath: path }))
            }
        })
    }

    return items
}
