import { Button, IconAdd24 } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { UploadDatabaseModal } from './upload-database-modal'

type UploadButtonProps = {
    onComplete: () => void
}

export const UploadButton: FC<UploadButtonProps> = ({ onComplete }) => {
    const [showModal, setShowModal] = useState<boolean>(false)

    const complete = () => {
        setShowModal(false)
        onComplete()
    }

    return (
        <>
            <Button icon={<IconAdd24 />} onClick={() => setShowModal(true)}>
                Upload database
            </Button>
            {showModal && <UploadDatabaseModal onClose={() => setShowModal(false)} onComplete={complete} />}
        </>
    )
}
