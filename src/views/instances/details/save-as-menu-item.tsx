import { MenuItem, IconSave16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { SaveAsModal } from './save-as-modal'
import { AsyncActionProps } from './actions-dropdown-menu'

export const SaveAsMenuItem: FC<AsyncActionProps> = ({ instanceId, stackName, onStart, onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    return (
        <>
            <MenuItem dense label="Save database as" icon={<IconSave16 />} onClick={() => setShowModal(true)} />
            {showModal && <SaveAsModal onClose={() => setShowModal(false)} instanceId={instanceId} stackName={stackName} onStart={onStart} onComplete={onComplete} />}
        </>
    )
}
