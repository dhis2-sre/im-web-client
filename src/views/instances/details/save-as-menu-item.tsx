import { MenuItem, IconSave16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { AsyncActionProps } from './action-types.ts'
import { SaveAsModal } from './save-as-modal.tsx'

export const SaveAsMenuItem: FC<AsyncActionProps & { savesFilestore?: boolean }> = ({ instanceId, stackName, savesFilestore, onStart, onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    return (
        <>
            <MenuItem dense label={savesFilestore ? 'Save database and file store as' : 'Save database as'} icon={<IconSave16 />} onClick={() => setShowModal(true)} />
            {showModal && (
                <SaveAsModal
                    onClose={() => setShowModal(false)}
                    instanceId={instanceId}
                    stackName={stackName}
                    savesFilestore={savesFilestore}
                    onStart={onStart}
                    onComplete={onComplete}
                />
            )}
        </>
    )
}
