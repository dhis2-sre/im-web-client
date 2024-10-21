import { Button, IconAdd24 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { UploadDatabaseModal } from './upload-database-modal.tsx'

type UploadButtonProps = {
    onComplete: () => void
    path: string
    groupName: string
    disabled: boolean
}

export const UploadButton: FC<UploadButtonProps> = ({ onComplete, path, groupName, disabled }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    const complete = () => {
        setShowModal(false)
        onComplete()
    }

    return (
        <>
            <Button icon={<IconAdd24 />} onClick={() => setShowModal(true)} disabled={disabled}>
                Upload database
            </Button>
            {showModal && <UploadDatabaseModal onClose={() => setShowModal(false)} onComplete={complete} currentPath={path} groupName={groupName} />}
        </>
    )
}
