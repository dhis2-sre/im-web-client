import { TreeItem } from '@mui/x-tree-view/TreeItem'
import { IconFolder24, IconFolderOpen24, IconDimensionData16 } from '@dhis2/ui-icons'
import React from 'react'
import styles from './CustomTreeItem.module.css'

interface CustomTreeItemProps {
    label: string
    open?: boolean
    leaf?: boolean
    onClick?: () => void
    selected?: boolean
}

export const CustomTreeItem: React.FC<CustomTreeItemProps> = ({ label, open, leaf, onClick, selected }) => {
    return (
        <TreeItem
            label={
                <div className={styles.itemContainer}>
                    <span className={styles.icon}>{leaf ? <IconDimensionData16 /> : open ? <IconFolderOpen24 /> : <IconFolder24 />}</span>
                    <span>{label}</span>
                </div>
            }
            onClick={onClick}
            selected={selected}
        />
    )
}
