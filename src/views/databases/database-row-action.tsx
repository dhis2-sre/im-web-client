import { Button, FlyoutMenu, MenuItem, Popover } from '@dhis2/ui'
import { colors } from '@dhis2/ui-constants'
import { IconMore24, IconCopy16, IconEditItems24 } from '@dhis2/ui-icons'
import { useCallback, FC, useState, useRef } from 'react'
import { CopyDatabaseModal } from './copy-database-modal.tsx'
import styles from './databases-list.module.css'
import { DeleteButton } from './delete-button.tsx'
import { DownloadButton } from './download-button.tsx'
import { RenameDatabaseModal } from './rename-database-modal.tsx'

type DatabaseRowProps = {
    database: {
        id?: number
        name: string
        slug: string
        createdAt: string
        updatedAt: string
    }
    groupName: string
    refetch: () => void
}

export const DatabaseRowAction: FC<DatabaseRowProps> = ({ database, groupName, refetch }) => {
    const [open, setOpen] = useState(false)
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
    const anchor = useRef<HTMLSpanElement>(null)

    const openRenameModal = () => setIsRenameModalOpen(true)
    const closeRenameModal = () => setIsRenameModalOpen(false)
    const openCopyModal = () => setIsCopyModalOpen(true)
    const closeCopyModal = () => setIsCopyModalOpen(false)

    const togglePopover = useCallback(() => {
        setOpen((currentOpen) => !currentOpen)
    }, [])

    return (
        <>
            <span ref={anchor}>
                <Button small secondary onClick={togglePopover} icon={<IconMore24 color={colors.grey600} />} />
            </span>
            {open && (
                <Popover reference={anchor} className={styles.actionMorePopover} arrow={false} placement="bottom-end" observeReferenceResize onClickOutside={() => togglePopover}>
                    <FlyoutMenu>
                        <DownloadButton id={database.id} onComplete={togglePopover} />
                        <DeleteButton id={database.id} togglePopover={togglePopover} databaseName={database.name} groupName={groupName} onComplete={refetch} />
                        <MenuItem dense label="Rename" icon={<IconEditItems24 />} onClick={openRenameModal} />
                        {isRenameModalOpen && (
                            <RenameDatabaseModal
                                togglePopover={togglePopover}
                                onClose={closeRenameModal}
                                onComplete={refetch}
                                databaseId={database.id}
                                currentName={database.name}
                            />
                        )}
                        <MenuItem dense label="Copy" icon={<IconCopy16 />} onClick={openCopyModal} />
                        {isCopyModalOpen && (
                            <CopyDatabaseModal togglePopover={togglePopover} onClose={closeCopyModal} onComplete={refetch} databaseId={database.id} currentName={database.name} />
                        )}
                    </FlyoutMenu>
                </Popover>
            )}
        </>
    )
}
