import { SimpleTreeView } from '@mui/x-tree-view'
import React from 'react'
import { CustomTreeItem } from './CustomTreeItem.tsx'

interface CustomTreeViewProps {
    expanded: string[]
    onExpanded: (expanded: string[]) => void
    selected: string
    onSelected: (selected: string) => void
    children: React.ReactNode
}

export const CustomTreeView: React.FC<CustomTreeViewProps> = ({ expanded, onExpanded, selected, onSelected, children }) => {
    const renderTree = (nodes: React.ReactNode): React.ReactNode => {
        return React.Children.map(nodes, (node) => {
            if (!React.isValidElement(node)) {
                return node
            }

            const { children, label, value } = node.props
            const hasChildren = React.Children.count(children) > 0
            const isExpanded = expanded.includes(value)
            const isSelected = selected === value

            return (
                <CustomTreeItem
                    label={label}
                    open={isExpanded}
                    leaf={!hasChildren}
                    onClick={() => {
                        if (hasChildren) {
                            onExpanded(isExpanded ? expanded.filter((id) => id !== value) : [...expanded, value])
                        }
                        onSelected(value)
                    }}
                    selected={isSelected}
                >
                    {hasChildren && renderTree(children)}
                </CustomTreeItem>
            )
        })
    }

    return (
        <SimpleTreeView expanded={expanded} selected={selected} onExpanded={onExpanded} onSelected={onSelected}>
            {renderTree(children)}
        </SimpleTreeView>
    )
}
