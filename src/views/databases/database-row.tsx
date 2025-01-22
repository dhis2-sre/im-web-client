import { DataTableRow, DataTableCell, Button, FlyoutMenu, MenuItem, Popover } from '@dhis2/ui'
import { colors } from '@dhis2/ui-constants'
import { IconMore24, IconCopy16, IconEditItems24 } from '@dhis2/ui-icons'
import React, { useCallback, FC, useState } from 'react'
import Moment from 'react-moment'
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
    openPopoverId: number | null
    setOpenPopoverId: (id: number | null) => void
    rowRef: (el: HTMLTableCellElement | null) => void
    rowRefs: React.MutableRefObject<(HTMLTableCellElement | null)[]>
    index: number
}

export const DatabaseRow: FC<DatabaseRowProps> = ({ database, groupName, refetch, openPopoverId, setOpenPopoverId, rowRef, rowRefs, index }) => {
    const handlePopoverToggle = useCallback(() => {
        setOpenPopoverId(openPopoverId === database.id ? null : database.id)
    }, [database.id, openPopoverId, setOpenPopoverId])
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)

    const openRenameModal = () => setIsRenameModalOpen(true)
    const closeRenameModal = () => setIsRenameModalOpen(false)
    const openCopyModal = () => setIsCopyModalOpen(true)
    const closeCopyModal = () => setIsCopyModalOpen(false)

    const onComplete = () => {
        refetch()
        closeRenameModal()
        closeCopyModal()
    }

    return (
        <DataTableRow key={database.id}>
            <DataTableCell>{database.name}</DataTableCell>
            <DataTableCell>{database.slug}</DataTableCell>
            <DataTableCell>
                <Moment date={database.createdAt} fromNow />
            </DataTableCell>
            <DataTableCell>
                <Moment date={database.updatedAt} fromNow />
            </DataTableCell>
            <DataTableCell className={styles.rowPopoverTrigger}>
                <div ref={rowRef}>
                    <Button small secondary onClick={handlePopoverToggle} icon={<IconMore24 color={colors.grey600} />} />
                </div>
                {openPopoverId === database.id && (
                    <Popover
                        reference={rowRefs.current[index]}
                        className={styles.actionMorePopover}
                        arrow={false}
                        placement="bottom-end"
                        observeReferenceResize={true}
                        onClickOutside={() => setOpenPopoverId(null)}
                    >
                        <FlyoutMenu>
                            <DownloadButton id={database.id} setOpen={setOpenPopoverId} />
                            <DeleteButton id={database.id} databaseName={database.name} groupName={groupName} onComplete={refetch} setOpen={setOpenPopoverId} />
                            <MenuItem dense label="Rename" icon={<IconEditItems24 />} onClick={openRenameModal} />
                            {isRenameModalOpen && (
                                <RenameDatabaseModal
                                    onClose={closeRenameModal}
                                    onComplete={onComplete}
                                    databaseId={database.id}
                                    currentName={database.name}
                                    setOpen={setOpenPopoverId}
                                />
                            )}
                            <MenuItem dense label="Copy" icon={<IconCopy16 />} onClick={openCopyModal} />
                            {isCopyModalOpen && (
                                <CopyDatabaseModal
                                    onClose={closeCopyModal}
                                    onComplete={onComplete}
                                    databaseId={database.id}
                                    setOpen={setOpenPopoverId}
                                    currentName={database.name}
                                    groupName={groupName}
                                />
                            )}
                        </FlyoutMenu>
                    </Popover>
                )}
            </DataTableCell>
        </DataTableRow>
    )
}
