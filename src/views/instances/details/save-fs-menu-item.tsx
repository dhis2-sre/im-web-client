import { IconSave16, MenuItem } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { AsyncActionProps } from './actions-dropdown-menu.tsx'
import { SaveFsModal } from './save-fs-modal.tsx'

export const SaveFsMenuItem: FC<AsyncActionProps> = ({ instanceId, onStart, onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    return (
        <>
            <MenuItem dense label="Save filestorage" icon={<IconSave16 />} onClick={() => setShowModal(true)} />
            {showModal && <SaveFsModal onClose={() => setShowModal(false)} instanceId={instanceId} stackName="" onStart={onStart} onComplete={onComplete} />}
        </>
    )
}
